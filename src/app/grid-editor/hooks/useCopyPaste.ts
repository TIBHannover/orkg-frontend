import { AgGridReact } from 'ag-grid-react';
import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

import { TData } from '@/app/grid-editor/context/GridContext';
import useConstraints from '@/app/grid-editor/hooks/useConstraints';
import useEntities from '@/app/grid-editor/hooks/useEntities';
import useSwrStatementsCache from '@/app/grid-editor/hooks/useSwrStatementsCache';
import { ENTITIES } from '@/constants/graphSettings';
import { createLiteral } from '@/services/backend/literals';
import { createStatement, getStatement, updateStatement } from '@/services/backend/statements';

interface UseCopyPasteProps {
    gridRef: React.RefObject<AgGridReact<TData> | null>;
}

const useCopyPaste = ({ gridRef }: UseCopyPasteProps) => {
    // Use refs instead of state to avoid re-renders
    const copiedValueRef = useRef<any>(null);
    const { canAddValue, isValidValue } = useConstraints();
    const { mutateStatement } = useSwrStatementsCache();
    const { entities } = useEntities();

    // Use ref to store current entities to avoid stale closure issues
    const entitiesRef = useRef(entities);
    entitiesRef.current = entities;

    // Copy-paste functionality using keyboard events - setup once, no dependencies to avoid re-renders
    useEffect(() => {
        // Function to persist pasted data to backend and update grid (like CustomCellEditor)
        const persistPastedData = async (api: any, rowIndex: number, colId: string, copiedStatement: any) => {
            try {
                const rowNode = api.getDisplayedRowAtIndex(rowIndex);
                if (!rowNode?.data) {
                    toast.dismiss();
                    toast.error('Unable to paste: row data not found');
                    return;
                }

                const currentEntities = entitiesRef.current;
                const entity = currentEntities?.find((e) => e.id === colId);
                const { predicate } = rowNode.data;

                if (!entity) {
                    toast.dismiss();
                    toast.error(`Unable to paste: entity not found for column ${colId}`);
                    return;
                }
                if (!predicate) {
                    toast.dismiss();
                    toast.error('Unable to paste: predicate not found');
                    return;
                }
                if (!copiedStatement?.object) {
                    toast.dismiss();
                    toast.error('Unable to paste: no copied data');
                    return;
                }
                if (!isValidValue(predicate.id, colId, copiedStatement.object)) {
                    toast.dismiss();
                    toast.error('Unable to paste: copied data is not a valid range');
                    return;
                }

                // Check if the target cell already has a statement (editMode like in CustomCellEditor)
                const currentStatement = rowNode.data.statements[colId];
                const editMode = !!currentStatement?.object;
                const isLiteral = copiedStatement.object._class === ENTITIES.LITERAL;

                let statementId: string;
                let objectId: string;

                if (isLiteral) {
                    // For literals, always create a new literal with the same label and datatype
                    objectId = await createLiteral(copiedStatement.object.label, copiedStatement.object.datatype);
                } else {
                    // For resources, use the same object id
                    objectId = copiedStatement.object.id;
                }

                if (editMode) {
                    // Update existing statement to point to new object (for literals) or same object (for resources)
                    await updateStatement(currentStatement.id, { object_id: objectId });
                    statementId = currentStatement.id;
                } else {
                    // Create a new statement
                    statementId = await createStatement(entity.id, predicate.id, objectId);
                }

                // Fetch the updated statement to get the complete data (like CustomCellEditor does)
                const updatedStatement = await getStatement(statementId);

                // Update the row data (this is sufficient, no need to invalidate cache)
                mutateStatement(updatedStatement, editMode ? currentStatement : undefined);

                const action = editMode ? 'updated' : 'created';
                toast.dismiss();
                toast.success(`Cell value pasted and ${action}`);
            } catch (error) {
                toast.dismiss();
                console.error('Error persisting pasted data:', error);
                toast.error('Failed to save pasted value');
            }
        };
        const handleKeyDown = async (event: KeyboardEvent) => {
            // Only handle copy/paste operations
            const isCopyOperation = (event.ctrlKey || event.metaKey) && event.key === 'c';
            const isPasteOperation = (event.ctrlKey || event.metaKey) && event.key === 'v';

            if (!isCopyOperation && !isPasteOperation) {
                return; // Don't interfere with other key events
            }

            // Get current grid state
            const api = gridRef.current?.api;
            if (!api) return;

            // Check if we're currently in cell editing mode or using autocomplete
            const focusedElement = document.activeElement;
            const isInEditMode =
                focusedElement &&
                (focusedElement.tagName === 'INPUT' ||
                    focusedElement.tagName === 'TEXTAREA' ||
                    (focusedElement as HTMLElement).contentEditable === 'true' ||
                    // Check for react-select components (autocomplete dropdown)
                    focusedElement.closest('.react-select__control') ||
                    focusedElement.closest('.react-select__menu') ||
                    focusedElement.closest('.react-select__option') ||
                    focusedElement.closest('.react-select__input') ||
                    // Check for CustomCellEditor component
                    focusedElement.closest('.custom-cell-editor') ||
                    // Check for any modal or dropdown that might be open
                    focusedElement.closest('[role="listbox"]') ||
                    focusedElement.closest('[role="option"]') ||
                    focusedElement.closest('[role="combobox"]'));

            // Don't interfere with copy/paste operations in edit mode or when autocomplete is active
            if (isInEditMode) return;

            // Get focused cell using AG Grid's API instead of tracking state
            const focusedCell = api.getFocusedCell();
            if (!focusedCell || !focusedCell.column) return;

            const colId = focusedCell.column.getColId();
            const { rowIndex } = focusedCell;

            // Skip if predicate column (not copyable/pastable)
            if (colId === 'predicate') return;

            // Copy functionality (Ctrl+C or Cmd+C)
            if (isCopyOperation) {
                event.preventDefault();
                event.stopPropagation();

                // Get the focused cell's value
                const rowNode = api.getDisplayedRowAtIndex(rowIndex);
                if (rowNode?.data) {
                    const cellValue = rowNode.data.statements[colId];
                    if (cellValue) {
                        copiedValueRef.current = cellValue;
                        toast.dismiss();
                        toast.success('Cell value copied');
                    } else {
                        toast.dismiss();
                        toast.info('No value to copy');
                    }
                }
                return;
            }

            // Paste functionality (Ctrl+V or Cmd+V)
            if (isPasteOperation && copiedValueRef.current) {
                event.preventDefault();
                event.stopPropagation();

                // Get the focused cell
                const rowNode = api.getDisplayedRowAtIndex(rowIndex);
                if (rowNode?.data) {
                    const { data } = rowNode;

                    // Check if user can add/edit this cell (only for empty cells)
                    const currentValue = data.statements[colId];
                    const isEmpty = !currentValue || !currentValue.object || !currentValue.object.id;

                    if (isEmpty) {
                        const canAddValueResult = canAddValue(data.predicate.id, colId);
                        if (!canAddValueResult) {
                            toast.dismiss();
                            toast.error('This property reached the maximum number of values set by template');
                            return;
                        }
                    }

                    // Persist the pasted data to backend (handles both edit and create cases)
                    await persistPastedData(api, rowIndex, colId, copiedValueRef.current);
                }
            }
        };

        // Add event listener once, no dependencies to avoid re-registering
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [canAddValue, isValidValue, gridRef]); // Dependencies for the useEffect

    return {
        // Expose current copied value for debugging if needed (but as a function to avoid re-renders)
        getCopiedValue: () => copiedValueRef.current,
    };
};

export default useCopyPaste;
