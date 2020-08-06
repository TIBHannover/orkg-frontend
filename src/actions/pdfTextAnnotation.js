import * as type from './types.js';
import { guid } from '../utils';

export const createAnnotation = annotation => dispatch => {
    dispatch({
        type: type.PDF_TEXT_ANNOTATION_CREATE_ANNOTATION,
        payload: {
            id: guid(),
            ...annotation
        }
    });
};

export const deleteAnnotation = annotationId => dispatch => {
    dispatch({
        type: type.PDF_TEXT_ANNOTATION_DELETE_ANNOTATION,
        payload: annotationId
    });
};
