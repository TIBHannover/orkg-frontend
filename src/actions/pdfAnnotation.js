import * as type from './types.js';

export const selectTool = tool => dispatch => {
    dispatch({
        type: type.PDF_ANNOTATION_SELECT_TOOL,
        payload: {
            tool
        }
    });
};

export const setPdf = pdf => dispatch => {
    dispatch({
        type: type.PDF_ANNOTATION_SET_PDF,
        payload: {
            pdf
        }
    });
};
