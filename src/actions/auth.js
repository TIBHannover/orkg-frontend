import * as type from './types';
import { getUserInformation } from 'services/backend/users';
import { Cookies } from 'react-cookie';

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

export function firstLoad() {
    return dispatch => {
        const cookies = new Cookies();
        const token = cookies.get('token') ? cookies.get('token') : null;
        const token_expires_in = cookies.get('token_expires_in') ? cookies.get('token_expires_in') : null;
        return getUserInformation()
            .then(userData => {
                dispatch(
                    updateAuth({
                        user: {
                            displayName: userData.display_name,
                            id: userData.id,
                            token: token,
                            tokenExpire: token_expires_in,
                            email: userData.email,
                            isCurationAllowed: userData.is_curation_allowed
                        }
                    })
                );
                return Promise.resolve();
            })
            .catch(() => {
                cookies.remove('token');
                cookies.remove('token_expires_in');
                dispatch({
                    type: type.RESET_AUTH
                });
            })
            .then(() => Promise.resolve());
    };
}

export const openAuthDialog = (action, signInRequired = false) => dispatch => {
    dispatch({
        type: type.OPEN_AUTHENTICATION_DIALOG,
        payload: {
            action,
            signInRequired
        }
    });
};

export const toggleAuthDialog = () => dispatch => {
    dispatch({
        type: type.TOGGLE_AUTHENTICATION_DIALOG
    });
};
