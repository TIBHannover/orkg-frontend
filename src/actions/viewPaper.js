import * as type from './types.js';
import * as addPaper from './addPaper';

export const selectContribution = ({contributionId: id, contributionIsLoaded}) => dispatch => {

    if (!contributionIsLoaded) {
        //let resourceId = guid(); //use this as ID in the future, when changing the data is possible
        
        dispatch({
            type: type.CREATE_CONTRIBUTION,
            payload: {
                id: id,
                resourceId: id,
            }
        });
        
        dispatch(addPaper.createResource({
        
            resourceId: id,
            label: 'test',
            existingResourceId: id
        
        }));
        
        dispatch(addPaper.fetchStatementsForResource({
            resourceId: id, 
            existingResourceId: id, 
            isContribution:true,
        }));
    }
    
    dispatch({
        type: type.SELECT_CONTRIBUTION,
        payload: {
            id
        }
    });

    dispatch({
        type: type.CLEAR_RESOURCE_HISTORY
    });

    dispatch({
        type: type.CLEAR_SELECTED_PROPERTY
    });

    dispatch({
        type: type.ADD_RESOURCE_HISTORY,
        payload: {
            //resourceId: id,
            label: 'Main',
        }
    });
}