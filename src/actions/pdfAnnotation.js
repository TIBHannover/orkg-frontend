import * as type from './types.js';

export const selectTool = tool => dispatch => {
    dispatch({
        type: type.PDF_ANNOTATION_SELECT_TOOL,
        payload: {
            tool
        }
    });
};

export const setFile = ({ pages, pdf, styles }) => dispatch => {
    dispatch({
        type: type.PDF_ANNOTATION_SET_FILE,
        payload: {
            pages,
            pdf,
            styles
        }
    });
};

export const setTableData = tableData => dispatch => {
    dispatch({
        type: type.PDF_ANNOTATION_SET_TABLE_DATA,
        payload: {
            tableData
        }
    });
};

export const updateTableData = dataChanges => dispatch => {
    dispatch({
        type: type.PDF_ANNOTATION_UPDATE_TABLE_DATA,
        payload: {
            dataChanges
        }
    });
};

export const setParsedPdfData = parsedPdfData => dispatch => {
    dispatch({
        type: type.PDF_ANNOTATION_SET_PARSED_PDF_DATA,
        payload: {
            parsedPdfData
        }
    });
};
