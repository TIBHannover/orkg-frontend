import * as type from '../actions/types';
import dotProp from 'dot-prop-immutable';

const initialState = {
    researchProblems: { }
}

export default (state = initialState, action) => {
    switch (action.type) {
       
        case type.SET_RESEARCH_PROBLEMS: { 
            let { payload } = action;

            let newState = dotProp.set(state, `researchProblems`, ids => ({ 
                ...ids, 
                [payload.resourceId]: payload.researchProblems
            }));
            
            return {
                ...newState,
            }
        }

        default: {
            return state
        }
    }
}