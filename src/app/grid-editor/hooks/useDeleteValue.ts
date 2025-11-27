import { AgGridReact } from 'ag-grid-react';
import React, { useEffect } from 'react';

import { TData } from '@/app/grid-editor/context/GridContext';
import { getFocusedCellInfo, isInEditMode as checkIsInEditMode } from '@/app/grid-editor/hooks/gridKeyboardHelpers';
import useSwrStatementsCache from '@/app/grid-editor/hooks/useSwrStatementsCache';
import Confirm from '@/components/Confirmation/Confirmation';
import { deleteStatementById } from '@/services/backend/statements';

interface UseDeleteValueProps {
    gridRef: React.RefObject<AgGridReact<TData> | null>;
}

const useDeleteValue = ({ gridRef }: UseDeleteValueProps) => {
    const { deleteStatements } = useSwrStatementsCache();

    useEffect(() => {
        const handleKeyDown = async (event: KeyboardEvent) => {
            // Only handle Delete key (not Backspace)
            if (event.key !== 'Delete') {
                return; // Don't interfere with other key events
            }

            // Don't interfere with delete operations in edit mode or when autocomplete/modal is active
            if (checkIsInEditMode()) return;

            // Get current grid state and focused cell
            const api = gridRef.current?.api;
            const cellInfo = getFocusedCellInfo(api);
            if (!cellInfo || !api) return;

            const { colId, rowIndex } = cellInfo;

            // Get the row node and data
            const rowNode = api.getDisplayedRowAtIndex(rowIndex);
            if (!rowNode?.data) return;

            const { data } = rowNode;
            const statement = data.statements[colId];

            // Check if cell has a value to delete
            if (!statement || !statement.id || !statement.object || !statement.object.id) {
                return; // Cell is already empty
            }

            // Prevent default behavior to avoid AG Grid's default delete
            event.preventDefault();
            event.stopPropagation();

            // Show confirmation dialog
            const isConfirmed = await Confirm({
                title: 'Delete cell value',
                message: 'Are you sure you want to delete this value?',
                proceedLabel: 'Delete',
                cancelLabel: 'Cancel',
            });

            if (!isConfirmed) {
                return; // User cancelled
            }

            try {
                // Update cache
                deleteStatements([statement.id]);

                // Delete from backend
                await deleteStatementById(statement.id);
            } catch (error) {
                console.error('Error deleting statement:', error);
            }
        };

        // Add event listener
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gridRef]);
};

export default useDeleteValue;
