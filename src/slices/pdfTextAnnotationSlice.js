import { createSlice } from '@reduxjs/toolkit';
import { guid } from 'utils';

const initialState = {
    annotations: [],
    pdf: null,
    isLoadedPdfViewer: false,
    zoom: 1.2,
    showHighlights: false,
    summaryFetched: false
};

export const pdfTextAnnotationSlice = createSlice({
    name: 'pdfTextAnnotation',
    initialState,
    reducers: {
        createAnnotation: (state, { payload }) => {
            state.annotations.push({ id: guid(), ...payload });
        },
        deleteAnnotation: (state, { payload }) => {
            state.annotations = state.annotations.filter(annotation => annotation.id !== payload);
        },
        updateAnnotationText: (state, { payload }) => {
            state.annotations = state.annotations.map(annotation => {
                if (annotation.id === payload.id) {
                    return {
                        ...annotation,
                        content: {
                            text: payload.text
                        }
                    };
                }
                return annotation;
            });
        },
        setPdf: (state, { payload }) => {
            state.pdf = payload.pdf;
        },
        changeZoom: (state, { payload }) => {
            state.zoom = payload;
        },
        setShowHighlights: (state, { payload }) => {
            state.showHighlights = payload;
        },
        setIsLoadedPdfViewer: (state, { payload }) => {
            state.isLoadedPdfViewer = payload;
        },
        setSummaryFetched: (state, { payload }) => {
            state.summaryFetched = payload;
        },
        discardChanges: state => {
            window.URL.revokeObjectURL(state.pdf);
            return initialState;
        }
    }
});

export const {
    createAnnotation,
    deleteAnnotation,
    updateAnnotationText,
    setPdf,
    changeZoom,
    setShowHighlights,
    setIsLoadedPdfViewer,
    setSummaryFetched,
    discardChanges
} = pdfTextAnnotationSlice.actions;

export default pdfTextAnnotationSlice.reducer;

export const uploadPdf = files => async dispatch => {
    if (files.length === 0) {
        return;
    }
    const pdf = window.URL.createObjectURL(files[0]);

    dispatch(setPdf({ pdf }));
};
