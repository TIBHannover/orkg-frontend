import * as type from 'actions/types';
import { omit } from 'lodash';
import dotProp from 'dot-prop-immutable';

const initialState = {
    contributions: {},
    statements: {},
    resources: {},
    literals: {},
    properties: {},
    papers: {},
    isLoading: false
};

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case type.BULK_CONTRIBUTION_EDITOR_CONTRIBUTIONS_LOAD: {
            const { contributions, statements, resources, literals, properties, papers } = action.payload;

            let newState = dotProp.merge({ ...state }, 'contributions', contributions);
            newState = dotProp.merge(newState, 'statements', statements);
            newState = dotProp.merge(newState, 'resources', resources);
            newState = dotProp.merge(newState, 'literals', literals);
            newState = dotProp.merge(newState, 'papers', papers);
            return dotProp.merge(newState, 'properties', properties);
        }

        case type.BULK_CONTRIBUTION_EDITOR_CONTRIBUTIONS_REMOVE: {
            const { contributionIds } = action.payload;
            return dotProp.set(state, 'contributions', omit(state.contributions, contributionIds));
        }

        case type.BULK_CONTRIBUTION_EDITOR_PAPER_UPDATE: {
            const { id, title } = action.payload;
            return dotProp.set(state, `papers.${id}.label`, title);
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
            const { statementId, contributionId, propertyId, resource } = action.payload;

            const newState = dotProp.merge({ ...state }, `statements.${statementId}`, {
                type: 'resource',
                contributionId,
                propertyId,
                objectId: resource.id
            });

            return dotProp.merge(newState, `resources.${resource.id}`, resource);
        }

        case type.BULK_CONTRIBUTION_EDITOR_LITERAL_CREATE: {
            const { statementId, contributionId, propertyId, literal } = action.payload;

            const newState = dotProp.merge({ ...state }, `statements.${statementId}`, {
                type: 'literal',
                contributionId,
                propertyId,
                objectId: literal.id
            });

            return dotProp.merge(newState, `literals.${literal.id}`, literal);
        }

        case type.BULK_CONTRIBUTION_EDITOR_PROPERTY_CREATE: {
            const { property } = action.payload;
            return dotProp.merge({ ...state }, `properties.${property.id}`, property);
        }

        case type.BULK_CONTRIBUTION_EDITOR_STATEMENT_DELETE: {
            const { id } = action.payload;
            return dotProp.delete(state, `statements.${id}`);
        }

        case type.BULK_CONTRIBUTION_EDITOR_RESOURCE_UPDATE: {
            const { id, resource } = action.payload;
            const newState = dotProp.set({ ...state }, `statements.${id}.objectId`, resource.id);
            return dotProp.set(newState, `resources.${resource.id}`, resource);
        }

        case type.BULK_CONTRIBUTION_EDITOR_PROPERTY_DELETE: {
            const { id, statementIds } = action.payload;
            const newState = dotProp.delete({ ...state }, `properties.${id}`);
            return dotProp.set(newState, 'statements', omit(state.statements, statementIds));
        }

        case type.BULK_CONTRIBUTION_EDITOR_PROPERTY_UPDATE: {
            const { id, newProperty, statementIds } = action.payload;

            let newState = dotProp.delete({ ...state }, `properties.${id}`);
            newState = dotProp.merge(newState, `properties.${newProperty.id}`, newProperty);

            for (const statementId of statementIds) {
                newState = dotProp.set(newState, `statements.${statementId}.propertyId`, newProperty.id);
            }

            return newState;
        }

        default: {
            return state;
        }
    }
}
