import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router'
import addPaper from './addPaper';
import viewPaper from './viewPaper';
import statementBrowser from './statementBrowser';

export default (history) => combineReducers({
    router: history ? connectRouter(history) : null,
    addPaper,
    viewPaper,
    statementBrowser,
});