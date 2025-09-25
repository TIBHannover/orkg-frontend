import { combineReducers } from '@reduxjs/toolkit';

import comparison from '@/slices/comparisonSlice';
import pdfAnnotation from '@/slices/pdfAnnotationSlice';
import pdfTextAnnotation from '@/slices/pdfTextAnnotationSlice';
import templateEditor from '@/slices/templateEditorSlice';
import viewPaper from '@/slices/viewPaperSlice';

// eslint-disable-next-line import/no-anonymous-default-export
export default (routerReducer) =>
    combineReducers({
        router: routerReducer,
        viewPaper,
        templateEditor,
        pdfAnnotation,
        pdfTextAnnotation,
        comparison,
    });
