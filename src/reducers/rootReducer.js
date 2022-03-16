import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import pdfAnnotation from 'reducers/pdfAnnotation';
import review from 'reducers/review';
import auth from 'slices/authSlice';
import statementBrowser from 'slices/statementBrowserSlice';
import addPaper from 'slices/addPaperSlice';
import viewPaper from 'slices/viewPaperSlice';
import literatureList from 'slices/literatureListSlice';
import contributionEditor from 'slices/contributionEditorSlice';
import templateEditor from 'slices/templateEditorSlice';
import pdfTextAnnotation from 'slices/pdfTextAnnotationSlice';

// eslint-disable-next-line import/no-anonymous-default-export
export default history =>
    combineReducers({
        router: history ? connectRouter(history) : null,
        auth,
        statementBrowser,
        addPaper,
        viewPaper,
        literatureList,
        contributionEditor,
        templateEditor,
        pdfAnnotation,
        pdfTextAnnotation,
        review
    });
