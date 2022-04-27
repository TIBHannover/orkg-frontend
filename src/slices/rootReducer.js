import { combineReducers } from 'redux';
import auth from 'slices/authSlice';
import statementBrowser from 'slices/statementBrowserSlice';
import addPaper from 'slices/addPaperSlice';
import viewPaper from 'slices/viewPaperSlice';
import list from 'slices/listSlice';
import contributionEditor from 'slices/contributionEditorSlice';
import review from 'slices/reviewSlice';
import templateEditor from 'slices/templateEditorSlice';
import pdfAnnotation from 'slices/pdfAnnotationSlice';
import pdfTextAnnotation from 'slices/pdfTextAnnotationSlice';

// eslint-disable-next-line import/no-anonymous-default-export
export default routerReducer =>
    combineReducers({
        router: routerReducer,
        auth,
        statementBrowser,
        addPaper,
        viewPaper,
        list,
        contributionEditor,
        review,
        templateEditor,
        pdfAnnotation,
        pdfTextAnnotation
    });
