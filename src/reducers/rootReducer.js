import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import addPaper from 'reducers/addPaper';
import auth from 'reducers/auth';
import statementBrowser from 'reducers/statementBrowser';
import pdfTextAnnotation from 'reducers/pdfTextAnnotation';
import viewPaper from 'reducers/viewPaper';
import pdfAnnotation from 'reducers/pdfAnnotation';
import addTemplate from 'reducers/addTemplate';
import review from 'reducers/review';
import list from 'slices/listSlice';
import contributionEditor from 'slices/contributionEditorSlice';

// eslint-disable-next-line import/no-anonymous-default-export
export default history =>
    combineReducers({
        router: history ? connectRouter(history) : null,
        addPaper,
        viewPaper,
        statementBrowser,
        pdfAnnotation,
        auth,
        addTemplate,
        pdfTextAnnotation,
        review,
        contributionEditor,
        list
    });
