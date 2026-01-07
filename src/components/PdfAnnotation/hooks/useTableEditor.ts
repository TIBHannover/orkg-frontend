import { HotTableRef } from '@handsontable/react-wrapper';
import { CellChange } from 'handsontable/common';
import { Selection } from 'handsontable/plugins/contextMenu';
import { cloneDeep, zip } from 'lodash';
import { RefObject, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { SURVEY_TABLES_IRI } from '@/components/PdfAnnotation/hooks/useOntology';
import {
    insertTableColumnLeft,
    insertTableColumnRight,
    insertTableRowAbove,
    insertTableRowBelow,
    redoTableState,
    removeTableColumn,
    removeTableRow,
    saveTableState,
    setTableData,
    splitCellsIntoColumns,
    undoTableState,
    updateTableData,
} from '@/slices/pdfAnnotationSlice';
import { RootStore } from '@/slices/types';

function useTableEditor(tableId: string, tableRef: RefObject<HotTableRef> | null) {
    const dispatch = useDispatch();
    const tableData = useSelector((state: RootStore) => state.pdfAnnotation.tableData[tableId]);
    const tableHistory = useSelector((state: RootStore) => state.pdfAnnotation.tableHistory[tableId]);
    const isSurveyTable = useSelector(
        (state: RootStore) => state.pdfAnnotation.annotations.find((annotation) => annotation.id === tableId)?.type === SURVEY_TABLES_IRI,
    );
    // Store the last selection to use when button is clicked (using ref to avoid re-renders)
    const lastSelectionRef = useRef<{ start: { row: number; col: number }; end: { row: number; col: number } } | null>(null);

    // Helper function to normalize any selection format to a consistent structure
    const getSelection = (selection?: Selection[]) => {
        const tableInstance = tableRef?.current?.hotInstance;
        if (!tableInstance) return null;

        // Get selection from: context menu -> stored ref -> current table
        const rawSelection = selection?.[0] || lastSelectionRef.current || tableInstance.getSelected();
        if (!rawSelection) return null;

        // Handle object format (stored selection)
        if (typeof rawSelection === 'object' && 'start' in rawSelection) {
            const sel = rawSelection as { start: { row: number; col: number }; end: { row: number; col: number } };
            return {
                start: {
                    row: Math.min(sel.start.row, sel.end.row),
                    col: Math.min(sel.start.col, sel.end.col),
                },
                end: {
                    row: Math.max(sel.start.row, sel.end.row),
                    col: Math.max(sel.start.col, sel.end.col),
                },
            };
        }

        // Handle array format [startRow, startCol, endRow, endCol]
        const selArray = (Array.isArray(rawSelection[0]) ? rawSelection[0] : rawSelection) as [number, number, number, number];
        return {
            start: {
                row: Math.min(selArray[0], selArray[2]),
                col: Math.min(selArray[1], selArray[3]),
            },
            end: {
                row: Math.max(selArray[0], selArray[2]),
                col: Math.max(selArray[1], selArray[3]),
            },
        };
    };

    // Helper function to restore selection after operations
    const restoreSelection = (
        selectionData: { start: { row: number; col: number }; end: { row: number; col: number } },
        rowOffset = 0,
        colOffset = 0,
    ) => {
        setTimeout(() => {
            const tableInstance = tableRef?.current?.hotInstance;
            if (tableInstance && selectionData) {
                const { start, end } = selectionData;
                const newStartRow = Math.max(0, start.row + rowOffset);
                const newStartCol = Math.max(0, start.col + colOffset);
                const newEndRow = Math.max(0, end.row + rowOffset);
                const newEndCol = Math.max(0, end.col + colOffset);
                tableInstance.selectCell(newStartRow, newStartCol, newEndRow, newEndCol);
            }
        }, 100);
    };

    const removeEmptyRows = () => {
        const tableInstance = tableRef?.current?.hotInstance;
        if (!tableInstance) return;
        const rowAmount = tableInstance.countRows();
        const toRemove = [];
        for (let i = 0; i < rowAmount; i += 1) {
            if (tableInstance.isEmptyRow(i)) {
                toRemove.push(i);
            }
        }
        const _tableData = cloneDeep(tableData);
        // Process indices in reverse order to avoid index shifting issues
        for (let i = toRemove.length - 1; i >= 0; i -= 1) {
            _tableData.splice(toRemove[i], 1);
        }
        dispatch(saveTableState({ id: tableId }));
        dispatch(setTableData({ id: tableId, tableData: _tableData }));
    };

    const mergeCellValues = (key?: string, selection?: Selection[]) => {
        const tableInstance = tableRef?.current?.hotInstance;
        if (!tableInstance) return;

        const selectionData = getSelection(selection);
        if (selectionData) {
            const { start: selectionStart, end: selectionEnd } = selectionData;
            const tableUpdates: CellChange[] = [];
            // Clone the table data once at the beginning
            const _tableData = cloneDeep(tableData);
            // Collect all non-empty values from the entire selection
            const allValues: string[] = [];
            for (let { row } = selectionStart; row <= selectionEnd.row; row += 1) {
                for (let { col } = selectionStart; col <= selectionEnd.col; col += 1) {
                    const cellValue = _tableData[row]?.[col] || '';
                    if (cellValue.trim()) {
                        allValues.push(cellValue.trim());
                    }
                }
            }
            // Create the merged value by joining all values with spaces
            const mergedValue = allValues.join(' ');
            // Clear all cells in the selection except the top-left cell
            for (let { row } = selectionStart; row <= selectionEnd.row; row += 1) {
                for (let { col } = selectionStart; col <= selectionEnd.col; col += 1) {
                    if (row === selectionStart.row && col === selectionStart.col) {
                        // Update the top-left cell with the merged value
                        tableUpdates.push([row, col, _tableData[row][col], mergedValue]);
                    } else {
                        // Clear all other cells in the selection
                        tableUpdates.push([row, col, _tableData[row]?.[col], '']);
                    }
                }
            }
            dispatch(saveTableState({ id: tableId }));
            dispatch(updateTableData({ id: tableId, dataChanges: tableUpdates }));

            // Restore the selection after the operation
            restoreSelection(selectionData);
        }
    };

    const removeRow = (key?: string, selection?: Selection[]) => {
        const selectionData = getSelection(selection);
        if (selectionData) {
            const { start: selectionStart } = selectionData;
            const rowIndex = selectionStart.row;
            dispatch(saveTableState({ id: tableId }));
            dispatch(removeTableRow({ id: tableId, rowIndex }));

            // Restore selection after row removal (select the row that moved up)
            restoreSelection(selectionData, -1, 0);
        }
    };

    const removeColumn = (key?: string, selection?: Selection[]) => {
        const selectionData = getSelection(selection);
        if (selectionData) {
            const { start: selectionStart } = selectionData;
            const columnIndex = selectionStart.col;
            dispatch(saveTableState({ id: tableId }));
            dispatch(removeTableColumn({ id: tableId, columnIndex }));

            // Restore selection after column removal (select the column that moved left)
            restoreSelection(selectionData, 0, -1);
        }
    };

    const insertRowAbove = (key?: string, selection?: Selection[]) => {
        const selectionData = getSelection(selection);
        if (selectionData) {
            const { start: selectionStart } = selectionData;
            const rowIndex = selectionStart.row;
            dispatch(saveTableState({ id: tableId }));
            dispatch(insertTableRowAbove({ id: tableId, rowIndex }));

            // Restore selection after row insertion (select the new row)
            restoreSelection(selectionData);
        }
    };

    const insertRowBelow = (key?: string, selection?: Selection[]) => {
        const selectionData = getSelection(selection);
        if (selectionData) {
            const { start: selectionStart } = selectionData;
            const rowIndex = selectionStart.row;
            dispatch(saveTableState({ id: tableId }));
            dispatch(insertTableRowBelow({ id: tableId, rowIndex }));

            // Restore selection after row insertion (select the row below)
            restoreSelection(selectionData, 1, 0);
        }
    };

    const insertColumnLeft = (key?: string, selection?: Selection[]) => {
        const selectionData = getSelection(selection);
        if (selectionData) {
            const { start: selectionStart } = selectionData;
            const columnIndex = selectionStart.col;
            dispatch(saveTableState({ id: tableId }));
            dispatch(insertTableColumnLeft({ id: tableId, columnIndex }));

            // Restore selection after column insertion (select the new column)
            restoreSelection(selectionData);
        }
    };

    const insertColumnRight = (key?: string, selection?: Selection[]) => {
        const selectionData = getSelection(selection);
        if (selectionData) {
            const { start: selectionStart } = selectionData;
            const columnIndex = selectionStart.col;
            dispatch(saveTableState({ id: tableId }));
            dispatch(insertTableColumnRight({ id: tableId, columnIndex }));

            // Restore selection after column insertion (select the column to the right)
            restoreSelection(selectionData, 0, 1);
        }
    };

    const splitIntoColumns = (key?: string, selection?: Selection[]) => {
        const selectionData = getSelection(selection);
        if (selectionData) {
            const { start: selectionStart, end: selectionEnd } = selectionData;
            const rowIndex = selectionStart.row;
            const columnIndex = selectionStart.col;

            // Get all selected rows
            const selectedRows = [];
            for (let r = selectionStart.row; r <= selectionEnd.row; r += 1) {
                selectedRows.push(r);
            }

            // Get the cell value from the first selected cell
            const cellValue = tableData[rowIndex]?.[columnIndex];
            if (!cellValue || typeof cellValue !== 'string') {
                return;
            }

            // Prompt for separator
            // eslint-disable-next-line no-alert
            const separator = prompt('Enter separator to split by (e.g., comma, semicolon, space):', ',');
            if (!separator) {
                return;
            }

            // Split the cell value by the separator to determine how many columns we need
            const splitValues = cellValue.split(separator).map((value) => value.trim());

            if (splitValues.length > 1) {
                dispatch(saveTableState({ id: tableId }));
                dispatch(
                    splitCellsIntoColumns({
                        id: tableId,
                        rowIndex,
                        columnIndex,
                        splitValues,
                        selectedRows,
                        separator,
                    }),
                );
            } else {
                // eslint-disable-next-line no-alert
                alert('No split found with the given separator. Please try a different separator.');
            }
        }
    };

    const undo = () => {
        dispatch(undoTableState({ id: tableId }));
    };

    const redo = () => {
        dispatch(redoTableState({ id: tableId }));
    };

    const transposeTable = () => {
        const transposed = zip(...cloneDeep(tableData));
        dispatch(setTableData({ id: tableId, tableData: transposed }));
    };

    const canUndo = tableHistory?.undo && tableHistory.undo.length > 0;
    const canRedo = tableHistory?.redo && tableHistory.redo.length > 0;

    // Update stored selection without causing re-renders
    const updateLastSelection = (selection: { start: { row: number; col: number }; end: { row: number; col: number } }) => {
        lastSelectionRef.current = selection;
    };

    return {
        transposeTable,
        mergeCellValues,
        removeEmptyRows,
        removeRow,
        removeColumn,
        insertRowAbove,
        insertRowBelow,
        insertColumnLeft,
        insertColumnRight,
        splitIntoColumns,
        undo,
        redo,
        canUndo,
        canRedo,
        updateLastSelection,
        isSurveyTable,
    };
}

export default useTableEditor;
