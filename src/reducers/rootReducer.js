import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import pdfTextAnnotation from 'reducers/pdfTextAnnotation';
import viewPaper from 'reducers/viewPaper';
import review from 'reducers/review';
import auth from 'slices/authSlice';
import statementBrowser from 'slices/statementBrowserSlice';
import addPaper from 'slices/addPaperSlice';
import literatureList from 'slices/literatureListSlice';
import contributionEditor from 'slices/contributionEditorSlice';
import templateEditor from 'slices/templateEditorSlice';
import pdfAnnotation from 'slices/pdfAnnotationSlice';

// eslint-disable-next-line import/no-anonymous-default-export
export default history =>
    combineReducers({
        router: history ? connectRouter(history) : null,
        addPaper,
        viewPaper,
        statementBrowser,
        pdfAnnotation,
        auth,
        pdfTextAnnotation,
        review,
        contributionEditor,
        literatureList,
        templateEditor
    });
