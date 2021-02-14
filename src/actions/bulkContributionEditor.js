import {
    getStatementsByObjectAndPredicate,
    getStatementsBySubjects,
    createResourceStatement,
    deleteStatementById
} from 'services/backend/statements';
import { updateLiteral as updateLiteralApi } from 'services/backend/literals';
import { CLASSES, PREDICATES } from 'constants/graphSettings';
import * as type from 'actions/types';

// load data
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

export const updateResource = ({ statementId, contributionId, propertyId, newResource }) => async dispatch => {
    console.log('{ statementId, contributionId, propertyId, newResource }', { statementId, contributionId, propertyId, newResource });
    dispatch(startLoading());

    // remove the existing statement
    dispatch(deleteStatement(statementId));

    // create the new statement
    const newStatement = await createResourceStatement(contributionId, propertyId, newResource.id);

    dispatch({
        type: type.BULK_CONTRIBUTION_EDITOR_RESOURCE_CREATE,
        payload: {
            statementId: newStatement.id,
            contributionId,
            propertyId,
            newResource
        }
    });
    dispatch(finishLoading());
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

export const createResourceValue = ({ contributionId, propertyId, resourceId }) => dispatch => {
    // create resource statement
};
export const createLiteralValue = ({ contributionId, propertyId, literalId }) => dispatch => {
    // create literal statement
};

// properties
export const createProperty = id => dispatch => {
    // create predicate
};
export const deleteProperty = id => dispatch => {
    // remove all statements with this predicate
};
export const updateProperty = ({ newId, oldId }) => dispatch => {
    // remove all statements with this predicate
    // create statements with the new property
};

// contributions
export const addContribution = id => dispatch => {};
export const updateContribution = ({ title, year }) => dispatch => {};

export const startLoading = () => ({
    type: type.BULK_CONTRIBUTION_EDITOR_LOADING_START
});

export const finishLoading = () => ({
    type: type.BULK_CONTRIBUTION_EDITOR_LOADING_FINISH
});
