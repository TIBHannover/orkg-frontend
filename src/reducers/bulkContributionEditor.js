import * as type from 'actions/types';
import { omit } from 'lodash';
import dotProp from 'dot-prop-immutable';

const initialState = {
    contributions: {},
    statements: {},
    resources: {},
    literals: {},
    properties: {},
    isLoading: false
};

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case type.BULK_CONTRIBUTION_EDITOR_CONTRIBUTIONS_LOAD: {
            const { contributions, statements, resources, literals, properties } = action.payload;

            let newState = { ...state };
            newState = dotProp.merge(newState, 'contributions', contributions);
            newState = dotProp.merge(newState, 'statements', statements);
            newState = dotProp.merge(newState, 'resources', resources);
            newState = dotProp.merge(newState, 'literals', literals);
            newState = dotProp.merge(newState, 'properties', properties);
            return newState;
        }

        case type.BULK_CONTRIBUTION_EDITOR_CONTRIBUTIONS_REMOVE: {
            const { contributionIds } = action.payload;

            return {
                ...state,
                contributions: {
                    ...omit(state.contributions, contributionIds)
                }
            };
        }

        case type.BULK_CONTRIBUTION_EDITOR_LITERAL_UPDATE: {
            const { id, label } = action.payload;
            return dotProp.set(state, `literals.${id}.label`, label);
        }

        case type.BULK_CONTRIBUTION_EDITOR_LOADING_START: {
            return dotProp.set(state, `isLoading`, true);
        }

        case type.BULK_CONTRIBUTION_EDITOR_LOADING_FINISH: {
            return dotProp.set(state, `isLoading`, false);
        }

        case type.BULK_CONTRIBUTION_EDITOR_RESOURCE_CREATE: {
            const { statementId, contributionId, propertyId, newResource } = action.payload;
            console.log('reducer', { statementId, contributionId, propertyId, newResource });
            let newState = { ...state };
            newState = dotProp.merge(newState, `statements.${statementId}`, {
                type: 'resource',
                contributionId,
                propertyId,
                objectId: newResource.id
            });

            newState = dotProp.merge(newState, `resources.${newResource.id}`, newResource);

            return newState;
        }

        case type.BULK_CONTRIBUTION_EDITOR_STATEMENT_DELETE: {
            const { id } = action.payload;
            return dotProp.delete(state, `statements.${id}`);
        }

        default: {
            return state;
        }
    }
}
