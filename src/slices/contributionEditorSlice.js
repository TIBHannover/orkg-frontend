import { guid } from 'utils';
import { createSlice } from '@reduxjs/toolkit';
import { getStatementsByObjectAndPredicate, getStatementsBySubjects, updateStatement } from 'services/backend/statements';
import { CLASSES, ENTITIES, PREDICATES } from 'constants/graphSettings';
import { createResource as createResourceApi, getResource } from 'services/backend/resources';
import { toast } from 'react-toastify';
import { createLiteral as createLiteralApi, updateLiteral as updateLiteralApi } from 'services/backend/literals';
import {
    createResourceStatement,
    deleteStatementById,
    createLiteralStatement,
    updateStatements,
    deleteStatementsByIds
} from 'services/backend/statements';
import { createPredicate, getPredicate } from 'services/backend/predicates';
import { LOCATION_CHANGE } from 'connected-react-router';

const initialState = {
    contributions: {},
    statements: {},
    resources: {},
    literals: {},
    properties: {},
    papers: {},
    isLoading: false,
    hasFailed: false
};

export const contributionEditorSlice = createSlice({
    name: 'contributionEditor',
    initialState,
    reducers: {
        contributionsAdded: (state, { payload: { contributions, statements, resources, literals, papers, properties } }) => {
            state.contributions = contributions;
            state.statements = statements;
            state.resources = resources;
            state.literals = literals;
            state.papers = papers;
            state.properties = properties;
        },
        setIsLoading: (state, { payload }) => {
            state.isLoading = payload;
        },
        setHasFailed: (state, { payload }) => {
            state.hasFailed = payload;
        },
        contributionsRemoved: (state, { payload }) => {
            for (const contributionId of payload) {
                delete state.contributions[contributionId];
            }
        },
        resourceAdded: (state, { payload: { statementId, contributionId, propertyId, resource } }) => {
            state.statements[statementId] = {
                type: ENTITIES.RESOURCE,
                contributionId,
                propertyId,
                objectId: resource.id
            };
            state.resources[resource.id] = resource;
        },
        resourceUpdated: (state, { payload: { id, resource } }) => {
            state.statements[id].objectId = resource.id;
            state.resources[resource.id] = resource;
        },
        literalAdded: (state, { payload: { statementId, contributionId, propertyId, literal } }) => {
            state.statements[statementId] = {
                type: ENTITIES.LITERAL,
                contributionId,
                propertyId,
                objectId: literal.id
            };
            state.literals[literal.id] = literal;
        },
        literalUpdated: (state, { payload: { id, label, datatype } }) => {
            state.literals[id].label = label;
            state.literals[id].datatype = datatype;
        },
        statementDeleted: (state, { payload }) => {
            delete state.statements[payload];
        },
        propertyAdded: (state, { payload }) => {
            state.properties[payload.id] = {
                ...payload,
                staticRowId: guid()
            };
        },
        propertyDeleted: (state, { payload: { id, statementIds } }) => {
            delete state.properties[id];
            for (const statementId of statementIds) {
                delete state.statements[statementId];
            }
        },
        propertyUpdated: (state, { payload: { id, newProperty, statementIds } }) => {
            state.properties[newProperty.id] = { ...newProperty, staticRowId: state.properties[id].staticRowId };
            delete state.properties[id];
            for (const statementId of statementIds) {
                state.statements[statementId].propertyId = newProperty.id;
            }
        },
        paperUpdated: (state, { payload: { id, title } }) => {
            state.papers[id].label = title;
        }
    },
    extraReducers: {
        [LOCATION_CHANGE]: () => initialState
    }
});

export const {
    contributionsAdded,
    setIsLoading,
    setHasFailed,
    contributionsRemoved,
    resourceUpdated,
    literalUpdated,
    statementDeleted,
    resourceAdded,
    literalAdded,
    propertyAdded,
    propertyDeleted,
    propertyUpdated,
    paperUpdated
} = contributionEditorSlice.actions;

export default contributionEditorSlice.reducer;

// TODO: move to other file
const getOrCreateResource = async ({ action, id, label, classes = [] }) => {
    let resource;
    if (action === 'create-option') {
        resource = await createResourceApi(label, classes);
    } else if (action === 'select-option') {
        resource = await getResource(id);
    }

    return resource;
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
// END TODO

export const loadContributions = contributionIds => async dispatch => {
    const resources = {};
    const literals = {};
    const statements = {};
    const contributions = {};
    const properties = {};
    const papers = {};

    dispatch(setIsLoading(true));
    dispatch(setHasFailed(false));

    const contributionsStatements = await getStatementsBySubjects({ ids: contributionIds });

    for (const contributionId of contributionIds) {
        const paperStatements = await getStatementsByObjectAndPredicate({ objectId: contributionId, predicateId: PREDICATES.HAS_CONTRIBUTION });
        const paper = paperStatements.find(statement => statement.subject.classes.includes(CLASSES.PAPER))?.subject;
        const contribution = paperStatements.find(statement => statement.object.classes.includes(CLASSES.CONTRIBUTION))?.object;
        const { statements: contributionStatements } = contributionsStatements.find(result => result.id === contributionId) || [];

        // show error if: corresponding paper not found, or provided ID is not a contribution ID
        if (!paper?.id || !contribution?.classes.includes(CLASSES.CONTRIBUTION)) {
            dispatch(setIsLoading(false));
            dispatch(setHasFailed(true));
            return;
        }

        contributions[contributionId] = { ...contribution, paperId: paper.id };
        papers[paper.id] = paper;

        for (const { id, predicate: property, object, Added_by } of contributionStatements) {
            statements[id] = {
                contributionId,
                Added_by: Added_by,
                propertyId: property.id,
                objectId: object.id,
                type: object._class
            };
            properties[property.id] = {
                ...property,
                staticRowId: guid()
            };
            if (object._class === ENTITIES.RESOURCE) {
                resources[object.id] = object;
            }
            if (object._class === ENTITIES.LITERAL) {
                literals[object.id] = object;
            }
        }
    }

    dispatch(
        contributionsAdded({
            contributions,
            statements,
            resources,
            literals,
            properties,
            papers
        })
    );
    dispatch(setIsLoading(false));
};

export const updateResource = ({ statementId, action, resourceId = null, resourceLabel = null, classes = [] }) => async dispatch => {
    const resource = await getOrCreateResource({
        action,
        id: resourceId,
        label: resourceLabel,
        classes
    });

    if (!resource) {
        return;
    }

    updateStatement(statementId, {
        object_id: resource.id
    }).catch(() => toast.error(`Error updating statement, please refresh the page`));

    dispatch(
        resourceUpdated({
            id: statementId,
            resource
        })
    );
};

export const updateLiteral = payload => async dispatch => {
    const { id, label, datatype } = payload;
    dispatch(setIsLoading(true));
    dispatch(literalUpdated(payload));
    await updateLiteralApi(id, label, datatype);
    dispatch(setIsLoading(false));
};

export const deleteStatement = id => dispatch => {
    deleteStatementById(id).catch(() => toast.error(`Error deleting statement, please refresh the page`));
    dispatch(statementDeleted(id));
};

export const createResource = ({ contributionId, propertyId, action, classes = [], resourceId = null, resourceLabel = null }) => async dispatch => {
    dispatch(setIsLoading(true));

    const resource = await getOrCreateResource({
        action,
        id: resourceId,
        label: resourceLabel,
        classes
    });

    if (!resource) {
        return;
    }

    // create the new statement
    const newStatement = await createResourceStatement(contributionId, propertyId, resource.id);

    dispatch(
        resourceAdded({
            statementId: newStatement.id,
            contributionId,
            propertyId,
            resource
        })
    );

    dispatch(setIsLoading(false));
};

export const createLiteral = ({ contributionId, propertyId, label, datatype }) => async dispatch => {
    dispatch(setIsLoading(true));

    // fetch the selected resource id
    const literal = await createLiteralApi(label, datatype);

    if (!literal) {
        return;
    }

    // create the new statement
    const newStatement = await createLiteralStatement(contributionId, propertyId, literal.id);

    dispatch(
        literalAdded({
            statementId: newStatement.id,
            contributionId,
            propertyId,
            literal
        })
    );

    dispatch(setIsLoading(false));
};

export const createProperty = ({ action, id = null, label = null }) => async dispatch => {
    const property = await getOrCreateProperty({ action, id, label });
    if (!property) {
        return;
    }
    dispatch(propertyAdded(property));
};

export const deleteProperty = ({ id, statementIds }) => dispatch => {
    deleteStatementsByIds(statementIds).catch(e => toast.error(`Error deleting statements, please refresh the page`));
    dispatch(
        propertyDeleted({
            id,
            statementIds
        })
    );
};

export const updateProperty = ({ id, statementIds, action, newId = null, newLabel = null }) => async dispatch => {
    const property = await getOrCreateProperty({ action, id: newId, label: newLabel });
    if (!property) {
        return;
    }

    updateStatements(statementIds, { predicate_id: property.id }).catch(e => toast.error(`Error updating statements, please refresh the page`));

    dispatch(
        propertyUpdated({
            id,
            newProperty: property,
            statementIds
        })
    );
};
