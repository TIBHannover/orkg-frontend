import * as type from 'actions/types';
import dotProp from 'dot-prop-immutable';

const initialState = {
    selectedTool: 'tableSelect', // possible values: 'tableSelect'
    pdf: null, // contains the raw uploaded file,
    pages: null, // contains the HTML content per page => array
    styles: null, // the styles needed to display the PDF,
    tableData: {}, // contains the table data when a table is being extracted
    parsedPdfData: null, // contains the parsed PDF data (from GROBID)
    tableRegions: {},
    cachedLabels: {}, // needed to convert IDs in the table to labels (e.g., P6000 > Machine),
    pdfParseIsFetching: false, // in case PDF is currently being parsed
    pdfParseFailed: false,
    pdfConvertIsFetching: false, // convert PDF is fetching
    pdfConvertFailed: false
};

// eslint-disable-next-line import/no-anonymous-default-export
export default (state = initialState, action) => {
    switch (action.type) {
        case type.PDF_ANNOTATION_SELECT_TOOL: {
            const { payload } = action;

            return {
                ...state,
                selectedTool: payload.tool
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

        case type.PDF_ANNOTATION_SET_LABEL_CACHE: {
            const { payload } = action;

            return {
                ...state,
                cachedLabels: {
                    ...state.cachedLabels,
                    [payload.id]: payload.label
                }
            };
        }

        case type.PDF_ANNOTATION_FETCH_PDF_PARSE_REQUEST: {
            return {
                ...state,
                pdfParseIsFetching: true,
                pdfParseFailed: false
            };
        }

        case type.PDF_ANNOTATION_FETCH_PDF_PARSE_FAILURE: {
            return {
                ...state,
                pdfParseIsFetching: false,
                pdfParseFailed: true,
                parsedPdfData: document.createElement('div') // create an empty parsing result
            };
        }

        case type.PDF_ANNOTATION_FETCH_PDF_PARSE_SUCCESS: {
            const { payload } = action;

            return {
                ...state,
                parsedPdfData: payload.parsedPdfData,
                pdfParseIsFetching: false,
                pdfParseFailed: false
            };
        }

        case type.PDF_ANNOTATION_FETCH_PDF_CONVERT_SUCCESS: {
            const { payload } = action;

            return {
                ...state,
                pdf: payload.pdf,
                pages: payload.pages,
                styles: payload.styles,
                pdfConvertIsFetching: false,
                pdfConvertFailed: false
            };
        }

        case type.PDF_ANNOTATION_FETCH_PDF_CONVERT_REQUEST: {
            return {
                ...state,
                pdfConvertIsFetching: true,
                pdfConvertFailed: false
            };
        }

        case type.PDF_ANNOTATION_FETCH_PDF_CONVERT_FAILURE: {
            return {
                ...state,
                pdfConvertIsFetching: false,
                pdfConvertFailed: true
            };
        }

        case type.PDF_ANNOTATION_RESET_DATA: {
            return initialState;
        }

        default: {
            return state;
        }
    }
};
