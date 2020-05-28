import * as type from '../actions/types';
import dotProp from 'dot-prop-immutable';

const initialState = {
    selectedTool: 'tableSelect', // possible values: 'tableSelect'
    pdf: null, // contains the raw uploaded file,
    pages: null, // contains the HTML content per page => array
    styles: null, // the styles needed to display the PDF,
    tableData: {}, // contains the table data when a table is being extracted
    parsedPdfData: null, // contains the parsed PDF data (from GROBID)
    tableRegions: {}
};

export default (state = initialState, action) => {
    switch (action.type) {
        case type.PDF_ANNOTATION_SELECT_TOOL: {
            const { payload } = action;

            return {
                ...state,
                selectedTool: payload.tool
            };
        }

        case type.PDF_ANNOTATION_SET_FILE: {
            const { payload } = action;

            return {
                ...state,
                pdf: payload.pdf,
                pages: payload.pages,
                styles: payload.styles
            };
        }

        case type.PDF_ANNOTATION_SET_TABLE_DATA: {
            const { payload } = action;

            return {
                ...state,
                tableData: {
                    ...state.tableData,
                    [payload.id]: payload.tableData
                }
            };
        }

        case type.PDF_ANNOTATION_UPDATE_TABLE_DATA: {
            const { dataChanges, id } = action.payload;

            const newData = state.tableData[id].slice(0);

            for (const [row, column, , newValue] of dataChanges) {
                newData[row][column] = newValue;
            }

            return {
                ...state,
                tableData: {
                    ...state.tableData,
                    [id]: newData
                }
            };
        }

        case type.PDF_ANNOTATION_SET_PARSED_PDF_DATA: {
            const { payload } = action;

            return {
                ...state,
                parsedPdfData: payload.parsedPdfData
            };
        }

        case type.PDF_ANNOTATION_SET_TABLE_REGION: {
            const { payload } = action;

            return {
                ...state,
                tableRegions: {
                    ...state.tableRegions,
                    [payload.id]: {
                        region: payload.region,
                        page: payload.page
                    }
                }
            };
        }

        case type.PDF_ANNOTATION_DELETE_TABLE_REGION: {
            const { payload } = action;

            return {
                ...dotProp.delete(state, `tableRegions.${[payload.id]}`)
            };
        }

        default: {
            return state;
        }
    }
};
