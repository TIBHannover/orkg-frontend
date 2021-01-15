import * as type from '../actions/types';

const initialState = {
    dialogIsOpen: false,
    action: 'signin',
    user: 0, // possible values: 0 (to differentiate first load from non-signedin but stay falsy), null (non signedin), or object (signedin)
    signInRequired: null,
    redirectRoute: null
};

// eslint-disable-next-line import/no-anonymous-default-export
export default (state = initialState, action) => {
    switch (action.type) {
        case type.UPDATE_AUTH:
            return {
                ...state,
                ...action.payload
            };
        case type.RESET_AUTH:
            return {
                ...state,
                user: null // ensure user is null (signedout) not 0 (first load)
            };

        case type.OPEN_AUTHENTICATION_DIALOG: {
            const { payload } = action;

            return {
                ...state,
                dialogIsOpen: true,
                action: payload.action,
                signInRequired: payload.signInRequired,
                redirectRoute: payload.redirectRoute
            };
        }

        case type.TOGGLE_AUTHENTICATION_DIALOG: {
            return {
                ...state,
                dialogIsOpen: !state.dialogIsOpen,
                redirectRoute: !state.dialogIsOpen ? state.redirectRoute : null // reset redirectRoute on close
            };
        }

        default: {
            return state;
        }
    }
};
