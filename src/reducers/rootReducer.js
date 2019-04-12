import { combineReducers } from 'redux';
import addPaper from './addPaper';
import viewPaper from './viewPaper';

import { connectRouter } from 'connected-react-router'

export default (history) => combineReducers({
    router: connectRouter(history),
    addPaper,
    viewPaper,
});