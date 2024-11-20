import { createSlice } from '@reduxjs/toolkit';
import { getUserInformation } from 'services/backend/users';
import { getToken } from 'services/keycloak';
import { AppDispatch, AuthSliceType, RootStore } from 'slices/types';

const initialState: AuthSliceType = {
    user: null, // object (signedin)
    initialized: false,
    authenticated: false,
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
            state.user = null; // ensure user is null (signedout)
        },
    },
});

export const { updateAuth, resetAuth } = authSlice.actions;

export default authSlice.reducer;

export function firstLoad() {
    return async (dispatch: AppDispatch) => {
        return getUserInformation()
            .then((userData) => {
                dispatch(
                    updateAuth({
                        user: {
                            displayName: userData.display_name,
                            id: userData.id,
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
