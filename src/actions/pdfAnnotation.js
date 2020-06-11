import * as type from './types.js';
import { guid } from '../utils';

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

export const setTableData = (id, tableData) => dispatch => {
    dispatch({
        type: type.PDF_ANNOTATION_SET_TABLE_DATA,
        payload: {
            tableData,
            id
        }
    });
};

export const updateTableData = (id, dataChanges) => dispatch => {
    dispatch({
        type: type.PDF_ANNOTATION_UPDATE_TABLE_DATA,
        payload: {
            dataChanges,
            id
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

export const addTableRegion = ({ region, page }) => dispatch => {
    const id = guid();

    dispatch({
        type: type.PDF_ANNOTATION_SET_TABLE_REGION,
        payload: {
            region,
            page,
            id
        }
    });
};

export const deleteTableRegion = id => dispatch => {
    dispatch({
        type: type.PDF_ANNOTATION_DELETE_TABLE_REGION,
        payload: {
            id
        }
    });
};

export const setLabelCache = ({ id, label }) => dispatch => {
    dispatch({
        type: type.PDF_ANNOTATION_SET_LABEL_CACHE,
        payload: {
            id,
            label
        }
    });
};
