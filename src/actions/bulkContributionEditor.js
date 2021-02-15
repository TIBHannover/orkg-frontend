import {
    getStatementsByObjectAndPredicate,
    getStatementsBySubjects,
    createResourceStatement,
    deleteStatementById,
    createLiteralStatement,
    updateStatements,
    deleteStatementsByIds,
    updateStatement
} from 'services/backend/statements';
import { createLiteral, updateLiteral as updateLiteralApi } from 'services/backend/literals';
import { CLASSES, PREDICATES } from 'constants/graphSettings';
import * as type from 'actions/types';
import { createResource, getResource } from 'services/backend/resources';
import { createPredicate, getPredicate } from 'services/backend/predicates';

export const loadContributions = contributionIds => async dispatch => {
    const resources = {};
    const literals = {};
    const statements = {};
    const contributions = {};
    const properties = {};

    dispatch(startLoading());

    const contributionsStatements = await getStatementsBySubjects({ ids: contributionIds });

    for (const contributionId of contributionIds) {
        const paperStatements = await getStatementsByObjectAndPredicate({ objectId: contributionId, predicateId: PREDICATES.HAS_CONTRIBUTION });
        const { label: paperTitle, id: paperId } = paperStatements.find(statement => statement.subject.classes.includes(CLASSES.PAPER))?.subject;
        const { label: contributionTitle } = paperStatements.find(statement => statement.object.classes.includes(CLASSES.CONTRIBUTION))?.object;
        const { statements: contributionStatements } = contributionsStatements.find(result => result.id === contributionId) || [];

        contributions[contributionId] = {
            id: contributionId,
            title: paperTitle,
            paperId: paperId,
            contributionLabel: contributionTitle,
            year: '1970'
        };

        for (const { id, predicate: property, object } of contributionStatements) {
            statements[id] = {
                contributionId,
                propertyId: property.id,
                objectId: object.id,
                type: object._class
            };
            properties[property.id] = property;
            if (object._class === 'resource') {
                resources[object.id] = object;
            }
            if (object._class === 'literal') {
                literals[object.id] = object;
            }
        }
    }

    dispatch({
        type: type.BULK_CONTRIBUTION_EDITOR_CONTRIBUTIONS_LOAD,
        payload: {
            contributions,
            statements,
            resources,
            literals,
            properties
        }
    });
    dispatch(finishLoading());
};

export const removeContributions = contributionIds => dispatch =>
    dispatch({
        type: type.BULK_CONTRIBUTION_EDITOR_CONTRIBUTIONS_REMOVE,
        payload: {
            contributionIds
        }
    });

export const updateResource = ({ statementId, action, resourceId = null, resourceLabel = null }) => async dispatch => {
    const resource = await getOrCreateResource({
        action,
        id: resourceId,
        label: resourceLabel
    });

    if (!resource) {
        return;
    }

    updateStatement(statementId, {
        object_id: resource.id
    });

    dispatch({
        type: type.BULK_CONTRIBUTION_EDITOR_RESOURCE_UPDATE,
        payload: {
            id: statementId,
            resource
        }
    });
};

export const updateLiteral = payload => async dispatch => {
    dispatch(startLoading());
    dispatch({
        type: type.BULK_CONTRIBUTION_EDITOR_LITERAL_UPDATE,
        payload: payload
    });

    const { id, label } = payload;
    await updateLiteralApi(id, label);
    dispatch(finishLoading());
};

export const deleteStatement = id => dispatch => {
    deleteStatementById(id);

    dispatch({
        type: type.BULK_CONTRIBUTION_EDITOR_STATEMENT_DELETE,
        payload: {
            id
        }
    });
};

const getOrCreateResource = async ({ action, id, label }) => {
    let resource;
    if (action === 'create-option') {
        resource = await createResource(label);
    } else if (action === 'select-option') {
        resource = await getResource(id);
    }

    return resource;
};

export const createResourceValue = ({ contributionId, propertyId, action, resourceId = null, resourceLabel = null }) => async dispatch => {
    dispatch(startLoading());

    const resource = await getOrCreateResource({
        action,
        id: resourceId,
        label: resourceLabel
    });

    if (!resource) {
        return;
    }

    // create the new statement
    const newStatement = await createResourceStatement(contributionId, propertyId, resource.id);

    dispatch({
        type: type.BULK_CONTRIBUTION_EDITOR_RESOURCE_CREATE,
        payload: {
            statementId: newStatement.id,
            contributionId,
            propertyId,
            resource
        }
    });

    dispatch(finishLoading());
};

export const createLiteralValue = ({ contributionId, propertyId, label }) => async dispatch => {
    dispatch(startLoading());

    // fetch the selected resource id
    const literal = await createLiteral(label);

    if (!literal) {
        return;
    }

    // create the new statement
    const newStatement = await createLiteralStatement(contributionId, propertyId, literal.id);

    dispatch({
        type: type.BULK_CONTRIBUTION_EDITOR_LITERAL_CREATE,
        payload: {
            statementId: newStatement.id,
            contributionId,
            propertyId,
            literal
        }
    });

    dispatch(finishLoading());
};

export const createProperty = ({ action, id = null, label = null }) => async dispatch => {
    const property = await getOrCreateProperty({ action, id, label });
    if (!property) {
        return;
    }

    dispatch({
        type: type.BULK_CONTRIBUTION_EDITOR_PROPERTY_CREATE,
        payload: {
            property
        }
    });
};

export const deleteProperty = ({ id, statementIds }) => dispatch => {
    deleteStatementsByIds(statementIds);

    dispatch({
        type: type.BULK_CONTRIBUTION_EDITOR_PROPERTY_DELETE,
        payload: {
            id,
            statementIds
        }
    });
};

const getOrCreateProperty = async ({ action, id, label }) => {
    let property;
    if (action === 'create-option') {
        property = await createPredicate(label);
    } else if (action === 'select-option') {
        property = await getPredicate(id);
    }

    return property;
};

export const updateProperty = ({ id, statementIds, action, newId = null, newLabel = null }) => async dispatch => {
    const property = await getOrCreateProperty({ action, id: newId, label: newLabel });
    if (!property) {
        return;
    }

    updateStatements(statementIds, { predicate_id: property.id });

    dispatch({
        type: type.BULK_CONTRIBUTION_EDITOR_PROPERTY_UPDATE,
        payload: {
            id,
            newProperty: property,
            statementIds
        }
    });
};

// contributions
export const updateContribution = ({ title, year }) => dispatch => {};

export const startLoading = () => ({
    type: type.BULK_CONTRIBUTION_EDITOR_LOADING_START
});

export const finishLoading = () => ({
    type: type.BULK_CONTRIBUTION_EDITOR_LOADING_FINISH
});
