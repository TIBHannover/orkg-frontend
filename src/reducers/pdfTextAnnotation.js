import * as type from '../actions/types';
import dotProp from 'dot-prop-immutable';

const initialState = {
    annotations: []
};

export default (state = initialState, action) => {
    switch (action.type) {
        case type.PDF_TEXT_ANNOTATION_CREATE_ANNOTATION: {
            const { payload } = action;

            return {
                ...state,
                annotations: [...state.annotations, payload]
            };
        }

        case type.PDF_TEXT_ANNOTATION_DELETE_ANNOTATION: {
            const { payload } = action;

            return {
                ...state,
                annotations: [...state.annotations.filter(annotation => annotation.id !== payload)]
            };
        }

        default: {
            return state;
        }
    }
};
