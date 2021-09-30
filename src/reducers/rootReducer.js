import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import addPaper from 'reducers/addPaper';
import auth from 'reducers/auth';
import statementBrowser from 'reducers/statementBrowser';
import pdfTextAnnotation from 'reducers/pdfTextAnnotation';
import viewPaper from 'reducers/viewPaper';
import pdfAnnotation from 'reducers/pdfAnnotation';
import addTemplate from 'reducers/addTemplate';
import contributionEditor from 'reducers/contributionEditor';
import smartReview from './smartReview';
import literatureList from './literatureList';

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
        smartReview,
        contributionEditor,
        literatureList
    });
