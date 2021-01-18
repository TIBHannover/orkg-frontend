import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import addPaper from './addPaper';
import auth from './auth';
import statementBrowser from './statementBrowser';
import pdfTextAnnotation from './pdfTextAnnotation';
import viewPaper from './viewPaper';
import pdfAnnotation from './pdfAnnotation';
import addTemplate from './addTemplate';
import smartArticle from './smartArticle';

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
        smartArticle
    });
