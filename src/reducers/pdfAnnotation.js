import * as type from '../actions/types';
import dotProp from 'dot-prop-immutable';
import assign from 'lodash/assign';
import { Cookies } from 'react-cookie';

const initialState = {
    selectedTool: null,
    pdf: null
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

        case type.PDF_ANNOTATION_SET_PDF: {
            const { payload } = action;

            return {
                ...state,
                pdf: payload.pdf
            };
        }

        default: {
            return state;
        }
    }
};
