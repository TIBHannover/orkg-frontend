import { createSlice } from '@reduxjs/toolkit';

import processPdf from '@/services/grobid';
import { AppDispatch, PdfAnnotation } from '@/slices/types';
import { guid } from '@/utils';

const initialState: PdfAnnotation = {
    annotations: [],
    pdf: undefined,
    isLoadedPdfViewer: false,
    scale: 1.6393237159,
    showHighlights: false,
    summaryFetched: false,
    tableData: {}, // Contains the table data when a table is being extracted
    parsedPdfData: undefined, // Contains the parsed PDF data (from GROBID)
    pageIndex: 0,
    tableHistory: {}, // Contains undo/redo history for each table
};

export const pdfAnnotationSlice = createSlice({
    name: 'pdfAnnotation',
    initialState,
    reducers: {
        createAnnotation: (state, { payload }) => {
            state.annotations.push({ id: guid(), ...payload });
        },
        deleteAnnotation: (state, { payload }) => {
            state.annotations = state.annotations.filter((annotation) => annotation.id !== payload);
            delete state.tableData[payload];
            delete state.tableHistory[payload];
        },
        updateTableData: (state, { payload: { id, dataChanges } }) => {
            const newTableData = state.tableData[id];
            for (const [row, column, , newValue] of dataChanges) {
                // Ensure the row exists
                if (!newTableData[row]) {
                    newTableData[row] = [];
                }
                // Ensure the row has enough columns
                while (newTableData[row].length <= column) {
                    newTableData[row].push('');
                }
                // Update the cell value
                newTableData[row][column] = newValue;
            }
            state.tableData[id] = newTableData;
        },
        updateAnnotation: (state, { payload }) => {
            state.annotations = state.annotations.map((annotation) => {
                if (annotation.id === payload.id) {
                    return {
                        ...annotation,
                        ...(payload.position && { position: { ...annotation.position, ...payload.position } }),
                        ...(payload.content && { content: { ...annotation.content, ...payload.content } }),
                        ...(payload.viewportPosition && { viewportPosition: { ...annotation.viewportPosition, ...payload.viewportPosition } }),
                    };
                }
                return annotation;
            });
        },
        updateAnnotationIsExtractionModalOpen: (state, { payload }) => {
            state.annotations = state.annotations.map((annotation) => {
                if (annotation.id === payload.id) {
                    return { ...annotation, isExtractionModalOpen: payload.isExtractionModalOpen };
                }
                return annotation;
            });
        },
        updateAnnotationText: (state, { payload }) => {
            state.annotations = state.annotations.map((annotation) => {
                if (annotation.id === payload.id) {
                    return {
                        ...annotation,
                        content: {
                            text: payload.text,
                        },
                    };
                }
                return annotation;
            });
        },
        setAnnotationView: (state, { payload }) => {
            state.annotations = state.annotations.map((annotation) => {
                if (annotation.id === payload.id) {
                    return { ...annotation, view: payload.view };
                }
                return annotation;
            });
        },
        setAnnotationImportedPapers: (state, { payload }) => {
            state.annotations = state.annotations.map((annotation) => {
                if (annotation.id === payload.id) {
                    return { ...annotation, importedPapers: payload.papers, importedContributions: payload.contributions };
                }
                return annotation;
            });
        },
        setAnnotationTableSaved: (state, { payload }) => {
            state.annotations = state.annotations.map((annotation) => {
                if (annotation.id === payload.id) {
                    return { ...annotation, tableId: payload.tableId, tableLabel: payload.tableLabel };
                }
                return annotation;
            });
        },
        setPdf: (state, { payload }) => {
            state.pdf = payload.pdf;
        },
        setParsedPdfData: (state, { payload }) => {
            state.parsedPdfData = payload;
        },
        changeZoom: (state, { payload }) => {
            state.scale = payload;
        },
        setShowHighlights: (state, { payload }) => {
            state.showHighlights = payload;
        },
        setIsLoadedPdfViewer: (state, { payload }) => {
            state.isLoadedPdfViewer = payload;
        },
        setSummaryFetched: (state, { payload }) => {
            state.summaryFetched = payload;
        },
        discardChanges: (state) => {
            if (state.pdf) {
                window.URL.revokeObjectURL(state.pdf);
            }
            return initialState;
        },
        setTableData: (state, { payload }) => {
            state.tableData[payload.id] = payload.tableData;
        },
        removeTableRow: (state, { payload: { id, rowIndex } }) => {
            const tableData = state.tableData[id];
            if (tableData && tableData[rowIndex]) {
                // Create a new array without the specified row
                state.tableData[id] = tableData.filter((_, index) => index !== rowIndex);
            }
        },
        removeTableColumn: (state, { payload: { id, columnIndex } }) => {
            const tableData = state.tableData[id];
            if (tableData) {
                // Create a new array with each row having the specified column removed
                state.tableData[id] = tableData.map((row) => row.filter((_, index) => index !== columnIndex));
            }
        },
        insertTableRowAbove: (state, { payload: { id, rowIndex } }) => {
            const tableData = state.tableData[id];
            if (tableData) {
                // Create a new empty row with the same number of columns as existing rows
                const emptyRow = new Array(tableData[0]?.length || 0).fill('');
                // Insert the new row at the specified index
                state.tableData[id] = [...tableData.slice(0, rowIndex), emptyRow, ...tableData.slice(rowIndex)];
            }
        },
        insertTableRowBelow: (state, { payload: { id, rowIndex } }) => {
            const tableData = state.tableData[id];
            if (tableData) {
                // Create a new empty row with the same number of columns as existing rows
                const emptyRow = new Array(tableData[0]?.length || 0).fill('');
                // Insert the new row after the specified index
                state.tableData[id] = [...tableData.slice(0, rowIndex + 1), emptyRow, ...tableData.slice(rowIndex + 1)];
            }
        },
        insertTableColumnLeft: (state, { payload: { id, columnIndex } }) => {
            const tableData = state.tableData[id];
            if (tableData) {
                // Insert a new empty column at the specified index for each row
                state.tableData[id] = tableData.map((row) => [...row.slice(0, columnIndex), '', ...row.slice(columnIndex)]);
            }
        },
        insertTableColumnRight: (state, { payload: { id, columnIndex } }) => {
            const tableData = state.tableData[id];
            if (tableData) {
                // Insert a new empty column after the specified index for each row
                state.tableData[id] = tableData.map((row) => [...row.slice(0, columnIndex + 1), '', ...row.slice(columnIndex + 1)]);
            }
        },
        splitCellsIntoColumns: (state, { payload: { id, rowIndex, columnIndex, splitValues, selectedRows, separator } }) => {
            const tableData = state.tableData[id];
            if (tableData && tableData[rowIndex] && splitValues.length > 1) {
                // First, insert new columns to the right of the selected cell for all rows
                const newTableData = tableData.map((row) => [
                    ...row.slice(0, columnIndex + 1), // Keep original cell and everything before it
                    ...new Array(splitValues.length - 1).fill(''), // Insert empty columns
                    ...row.slice(columnIndex + 1), // Keep everything after the original cell
                ]);

                // Then, process each selected row
                const updatedTableData = newTableData.map((row, rIndex) => {
                    // Check if this row is in the selected rows
                    if (selectedRows && selectedRows.includes(rIndex)) {
                        const cellValue = tableData[rIndex]?.[columnIndex];
                        if (cellValue && typeof cellValue === 'string') {
                            // Split this row's cell value using the same separator
                            const currentSplitValues = cellValue.split(separator).map((value) => value.trim());

                            // Only proceed if this cell actually has content to split
                            if (currentSplitValues.length > 1) {
                                return [
                                    ...row.slice(0, columnIndex), // Everything before the cell
                                    ...currentSplitValues, // Split values for this specific cell
                                    ...row.slice(columnIndex + currentSplitValues.length), // Everything after the new columns
                                ];
                            }
                        }
                    }
                    return row; // Return unchanged row if not selected or no valid cell value
                });

                state.tableData[id] = updatedTableData;
            }
        },
        saveTableState: (state, { payload: { id } }) => {
            const tableData = state.tableData[id];
            if (tableData) {
                // Initialize history for this table if it doesn't exist
                if (!state.tableHistory[id]) {
                    state.tableHistory[id] = { undo: [], redo: [] };
                }

                // Save current state to undo stack
                state.tableHistory[id].undo.push(JSON.parse(JSON.stringify(tableData)));

                // Clear redo stack when new action is performed
                state.tableHistory[id].redo = [];

                // Limit undo stack to 50 items to prevent memory issues
                if (state.tableHistory[id].undo.length > 50) {
                    state.tableHistory[id].undo.shift();
                }
            }
        },
        undoTableState: (state, { payload: { id } }) => {
            const history = state.tableHistory[id];
            if (history && history.undo.length > 0) {
                // Move current state to redo stack
                const currentState = state.tableData[id];
                if (currentState) {
                    history.redo.push(JSON.parse(JSON.stringify(currentState)));
                }

                // Restore previous state
                const previousState = history.undo.pop();
                if (previousState) {
                    state.tableData[id] = previousState;
                }
            }
        },
        redoTableState: (state, { payload: { id } }) => {
            const history = state.tableHistory[id];
            if (history && history.redo.length > 0) {
                // Move current state to undo stack
                const currentState = state.tableData[id];
                if (currentState) {
                    history.undo.push(JSON.parse(JSON.stringify(currentState)));
                }

                // Restore next state
                const nextState = history.redo.pop();
                if (nextState) {
                    state.tableData[id] = nextState;
                }
            }
        },
    },
});

export const {
    createAnnotation,
    deleteAnnotation,
    updateAnnotation,
    updateAnnotationText,
    updateAnnotationIsExtractionModalOpen,
    setAnnotationView,
    setAnnotationImportedPapers,
    setAnnotationTableSaved,
    setPdf,
    changeZoom,
    setShowHighlights,
    setIsLoadedPdfViewer,
    setSummaryFetched,
    discardChanges,
    setParsedPdfData,
    setTableData,
    updateTableData,
    removeTableRow,
    removeTableColumn,
    insertTableRowAbove,
    insertTableRowBelow,
    insertTableColumnLeft,
    insertTableColumnRight,
    splitCellsIntoColumns,
    saveTableState,
    undoTableState,
    redoTableState,
} = pdfAnnotationSlice.actions;

export default pdfAnnotationSlice.reducer;

/**
 * Parsing the PDF using Grobid, needed for getting individual references
 *
 * @param {Object} pdf the uploaded pdf file object
 */
export const parsePdf =
    ({ pdf }: { pdf: File }) =>
    async (dispatch: AppDispatch) => {
        try {
            const parsedPdf = await processPdf({ pdf });
            dispatch(setParsedPdfData(parsedPdf));
        } catch (e) {
            console.error(e);
        }
    };

export const uploadPdf = (files: FileList) => async (dispatch: AppDispatch) => {
    if (files.length === 0) {
        return;
    }
    const pdf = window.URL.createObjectURL(files[0]);
    dispatch(setPdf({ pdf }));
    dispatch(parsePdf({ pdf: files[0] }));
};
