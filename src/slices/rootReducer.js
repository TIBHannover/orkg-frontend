import { combineReducers } from 'redux';
import auth from 'slices/authSlice';
import comparison from 'slices/comparisonSlice';
import contributionEditor from 'slices/contributionEditorSlice';
import pdfAnnotation from 'slices/pdfAnnotationSlice';
import pdfTextAnnotation from 'slices/pdfTextAnnotationSlice';
import review from 'slices/reviewSlice';
import statementBrowser from 'slices/statementBrowserSlice';
import templateEditor from 'slices/templateEditorSlice';
import viewPaper from 'slices/viewPaperSlice';

// eslint-disable-next-line import/no-anonymous-default-export
export default (routerReducer) =>
    combineReducers({
        router: routerReducer,
        auth,
        statementBrowser,
        viewPaper,
        contributionEditor,
        review,
        templateEditor,
        pdfAnnotation,
        pdfTextAnnotation,
        comparison,
    });
