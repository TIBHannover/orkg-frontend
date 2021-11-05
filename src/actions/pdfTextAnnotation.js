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

export const updateAnnotationText = payload => dispatch => {
    dispatch({
        type: type.PDF_TEXT_ANNOTATION_UPDATE_ANNOTATION,
        payload
    });
};

export const changeZoom = zoom => dispatch => {
    dispatch({
        type: type.PDF_TEXT_ANNOTATION_CHANGE_ZOOM,
        payload: {
            zoom
        }
    });
};

export const setSummaryFetched = summaryFetched => dispatch => {
    dispatch({
        type: type.PDF_TEXT_ANNOTATION_SET_SUMMARY_FETCHED,
        payload: {
            summaryFetched
        }
    });
};

export const setShowHighlights = showHighlights => dispatch => {
    dispatch({
        type: type.PDF_TEXT_ANNOTATION_SET_SHOW_HIGHLIGHTS,
        payload: {
            showHighlights
        }
    });
};

export const setIsLoadedPdfViewer = isLoadedPdfViewer => dispatch => {
    dispatch({
        type: type.PDF_TEXT_ANNOTATION_SET_IS_LOADED_PDF_VIEWER,
        payload: {
            isLoadedPdfViewer
        }
    });
};

export const uploadPdf = files => async dispatch => {
    if (files.length === 0) {
        return;
    }
    const pdf = window.URL.createObjectURL(files[0]);

    dispatch({
        type: type.PDF_TEXT_ANNOTATION_SET_PDF,
        payload: {
            pdf
        }
    });
};

export const discardChanges = () => dispatch => {
    dispatch({
        type: type.PDF_TEXT_ANNOTATION_RESET
    });
};
