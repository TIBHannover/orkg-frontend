import { combineReducers } from 'redux';
import auth from 'slices/authSlice';
import statementBrowser from 'slices/statementBrowserSlice';
import viewPaper from 'slices/viewPaperSlice';
import contributionEditor from 'slices/contributionEditorSlice';
import review from 'slices/reviewSlice';
import templateEditor from 'slices/templateEditorSlice';
import pdfAnnotation from 'slices/pdfAnnotationSlice';
import pdfTextAnnotation from 'slices/pdfTextAnnotationSlice';
import comparison from 'slices/comparisonSlice';

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
