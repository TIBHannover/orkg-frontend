import * as type from './types';

export const updateAuth = payload => dispatch => {
    dispatch({
        type: type.UPDATE_AUTH,
        payload
    });
};

export const resetAuth = () => dispatch => {
    dispatch({
        type: type.RESET_AUTH
    });
};

export const openAuthDialog = action => dispatch => {
    dispatch({
        type: type.OPEN_AUTHENTICATION_DIALOG,
        payload: {
            action
        }
    });
};

export const toggleAuthDialog = () => dispatch => {
    dispatch({
        type: type.TOGGLE_AUTHENTICATION_DIALOG
    });
};
