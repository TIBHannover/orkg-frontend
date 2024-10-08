import { createSlice } from '@reduxjs/toolkit';
import { env } from 'next-runtime-env';
import { Cookies } from 'react-cookie';
import { Dispatch } from 'redux';
import { getUserInformation } from 'services/backend/users';
import { AuthSliceType, RootStore } from 'slices/types';

const initialState: AuthSliceType = {
    dialogIsOpen: false,
    action: 'signin',
    user: 0, // possible values: 0 (to differentiate first load from non-signedin but stay falsy), null (non signedin), or object (signedin)
    signInRequired: null,
    redirectRoute: null,
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        updateAuth: (state, { payload }) => ({
            ...state,
            ...payload,
        }),
        resetAuth: (state) => {
            state.user = null; // ensure user is null (signedout) not 0 (first load)
        },
        openAuthDialog: (state, { payload }) => {
            state.dialogIsOpen = true;
            state.action = payload.action;
            state.signInRequired = payload.signInRequired;
            state.redirectRoute = payload.redirectRoute;
        },
        toggleAuthDialog: (state) => {
            state.dialogIsOpen = !state.dialogIsOpen;
            state.redirectRoute = !state.dialogIsOpen ? state.redirectRoute : null; // reset redirectRoute on close
        },
    },
});

export const { updateAuth, resetAuth, openAuthDialog, toggleAuthDialog } = authSlice.actions;

export default authSlice.reducer;

export function firstLoad() {
    return (dispatch: Dispatch) => {
        const cookies = new Cookies();
        const token = cookies.get('token') ? cookies.get('token') : null;
        const tokenExpiresIn = cookies.get('token_expires_in') ? cookies.get('token_expires_in') : null;
        return getUserInformation()
            .then((userData) => {
                dispatch(
                    updateAuth({
                        user: {
                            displayName: userData.display_name,
                            id: userData.id,
                            token,
                            tokenExpire: tokenExpiresIn,
                            email: userData.email,
                            isCurationAllowed: userData.is_curation_allowed,
                            organization_id: userData.organization_id,
                            observatory_id: userData.observatory_id,
                        },
                    }),
                );
                return Promise.resolve();
            })
            .catch(() => {
                cookies.remove('token', { path: env('NEXT_PUBLIC_PUBLIC_URL') });
                cookies.remove('token_expires_in', { path: env('NEXT_PUBLIC_PUBLIC_URL') });
                dispatch(resetAuth());
            })
            .then(() => Promise.resolve());
    };
}

/**
 * Check if the user has a curation role
 *
 */
export function isCurationAllowed(state: RootStore): boolean {
    const { user } = state.auth;
    return !!(user && user.isCurationAllowed);
}
