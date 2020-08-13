import * as type from '../actions/types';

const initialState = {
    dialogIsOpen: false,
    action: 'signin',
    user: null,
    signInRequired: null
};

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
                user: null
            };

        case type.OPEN_AUTHENTICATION_DIALOG: {
            const { payload } = action;

            return {
                ...state,
                dialogIsOpen: true,
                action: payload.action,
                signInRequired: payload.signInRequired
            };
        }

        case type.TOGGLE_AUTHENTICATION_DIALOG: {
            return {
                ...state,
                dialogIsOpen: !state.dialogIsOpen
            };
        }

        default: {
            return state;
        }
    }
};
