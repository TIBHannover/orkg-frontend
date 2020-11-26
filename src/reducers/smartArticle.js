import * as type from 'actions/types';
import merge from 'lodash/merge';
import dotProp from 'dot-prop-immutable';
import { Cookies } from 'react-cookie';
import env from '@beam-australia/react-env';

const initialState = {
    paperResource: {},
    authorResources: [],
    sectionResources: [],
    isLoading: false
};

export default (state = initialState, action) => {
    switch (action.type) {
        case type.ARTICLE_WRITER_LOAD: {
            const { paperResource, authorResources, sectionResources } = action.payload;

            return {
                ...state,
                paperResource,
                authorResources,
                sectionResources
            };
        }

        case type.ARTICLE_WRITER_SET_IS_LOADING: {
            const { isLoading } = action;

            return {
                ...state,
                isLoading
            };
        }

        case type.ARTICLE_WRITER_UPDATE_TITLE: {
            const { title } = action;

            return {
                ...state,
                paperResource: {
                    ...state.paperResource,
                    title
                }
            };
        }

        case type.ARTICLE_WRITER_UPDATE_AUTHORS: {
            const { authorResources } = action;

            return {
                ...state,
                authorResources
            };
        }

        case '@@router/LOCATION_CHANGE': {
            return {
                ...initialState
            };
        }

        default: {
            return state;
        }
    }
};
