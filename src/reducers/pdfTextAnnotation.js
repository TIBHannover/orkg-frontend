import * as type from '../actions/types';

const initialState = {
    annotations: [],
    pdf: null,
    encodedPdf: null
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

        case type.PDF_TEXT_ANNOTATION_UPDATE_ANNOTATION: {
            const { payload } = action;

            return {
                ...state,
                annotations: [
                    ...state.annotations.map(annotation => {
                        if (annotation.id === payload.id) {
                            return {
                                ...annotation,
                                content: {
                                    text: payload.text
                                }
                            };
                        }
                        return annotation;
                    })
                ]
            };
        }

        case type.PDF_TEXT_ANNOTATION_SET_PDF: {
            const { payload } = action;

            return {
                ...state,
                pdf: payload.pdf,
                encodedPdf: payload.encodedPdf
            };
        }

        default: {
            return state;
        }
    }
};
