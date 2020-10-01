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

export const setPdfViewer = pdfViewer => dispatch => {
    dispatch({
        type: type.PDF_TEXT_ANNOTATION_SET_PDF_VIEWER,
        payload: {
            pdfViewer
        }
    });
};

const toBase64 = file =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

export const uploadPdf = files => async dispatch => {
    if (files.length === 0) {
        return;
    }

    const pdf = files[0];
    const encodedPdf = await toBase64(files[0]);

    dispatch({
        type: type.PDF_TEXT_ANNOTATION_SET_PDF,
        payload: {
            pdf: pdf,
            encodedPdf: encodedPdf
        }
    });
};

export const discardChanges = () => dispatch => {
    dispatch({
        type: type.PDF_TEXT_ANNOTATION_RESET
    });
};
