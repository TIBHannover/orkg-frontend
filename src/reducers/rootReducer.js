import { combineReducers } from 'redux';
import addPaper from './addPaper';
import { connectRouter } from 'connected-react-router'

export default (history) => combineReducers({
    router: connectRouter(history),
    addPaper
});