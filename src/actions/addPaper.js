import * as type from './types.js';
import { guid } from '../utils';
import { mergeWith, isArray, uniqBy } from 'lodash';
import {
    createResource,
    selectResource,
    createProperty,
    createValue,
    loadStatementBrowserData,
    updateContributionLabel as updateContributionLabelInSB
} from './statementBrowser';
import { createResource as createResourceApi } from 'services/backend/resources';
import { createResourceStatement, createLiteralStatement } from 'services/backend/statements';
import { saveFullPaper } from 'services/backend/papers';
import { createLiteral } from 'services/backend/literals';
import { createPredicate } from 'services/backend/predicates';
import { toast } from 'react-toastify';
import { PREDICATES, MISC } from 'constants/graphSettings';

export const updateGeneralData = data => dispatch => {
    dispatch({
        type: type.UPDATE_GENERAL_DATA,
        payload: data
    });
};

export const nextStep = () => dispatch => {
    dispatch({
        type: type.ADD_PAPER_NEXT_STEP
    });
};

export const previousStep = () => dispatch => {
    dispatch({
        type: type.ADD_PAPER_PREVIOUS_STEP
    });
};

export const blockNavigation = () => dispatch => {
    dispatch({
        type: type.ADD_PAPER_BLOCK_NAVIGATION
    });
};

export const loadPaperData = data => dispatch => {
    dispatch({
        type: type.ADD_PAPER_LOAD_DATA,
        payload: data.addPaper
    });

    dispatch(loadStatementBrowserData(data.statementBrowser));
};

export const updateResearchField = data => dispatch => {
    dispatch({
        type: type.UPDATE_RESEARCH_FIELD,
        payload: data
    });
};

export const closeTour = () => dispatch => {
    dispatch({
        type: type.CLOSE_TOUR
    });
};

export const openTour = step => dispatch => {
    dispatch({
        type: type.OPEN_TOUR,
        payload: {
            step: step ? step : 0
        }
    });
};

export const updateAbstract = data => dispatch => {
    dispatch({
        type: type.UPDATE_ABSTRACT,
        payload: data
    });
};

export const createAnnotation = data => dispatch => {
    dispatch({
        type: type.CREATE_ANNOTATION,
        payload: {
            id: guid(),
            ...data
        }
    });
};

export const toggleEditAnnotation = data => dispatch => {
    dispatch({
        type: type.TOGGLE_EDIT_ANNOTATION,
        payload: data
    });
};

export const removeAnnotation = data => dispatch => {
    dispatch({
        type: type.REMOVE_ANNOTATION,
        payload: data
    });
};

export const validateAnnotation = data => dispatch => {
    dispatch({
        type: type.VALIDATE_ANNOTATION,
        payload: data
    });
};

export const updateAnnotationClass = data => dispatch => {
    dispatch({
        type: type.UPDATE_ANNOTATION_CLASS,
        payload: data
    });
};

export const clearAnnotations = () => dispatch => {
    dispatch({
        type: type.CLEAR_ANNOTATIONS
    });
};

export const createContribution = ({ selectAfterCreation = false, prefillStatements: performPrefill = false, statements = null }) => (
    dispatch,
    getState
) => {
    const newResourceId = guid();
    const newContributionId = guid();
    const newContributionLabel = `Contribution ${getState().addPaper.contributions.allIds.length + 1}`;

    dispatch({
        type: type.CREATE_CONTRIBUTION,
        payload: {
            id: newContributionId,
            resourceId: newResourceId,
            label: newContributionLabel
        }
    });

    dispatch(
        createResource({
            resourceId: newResourceId,
            label: newContributionLabel
        })
    );

    if (selectAfterCreation) {
        dispatch(
            selectResource({
                increaseLevel: false,
                resourceId: newResourceId,
                label: newContributionLabel
            })
        );

        /*dispatch({
            type: type.ADD_RESOURCE_HISTORY,
            payload: {
                resourceId: newResourceId,
                label: 'Main',
            }
        });*/
    }

    if (performPrefill && statements) {
        dispatch(
            prefillStatements({
                statements,
                resourceId: newResourceId
            })
        );
    }
};

/**
 * prefill the statements of a resource
 * (e.g : new store to show resource in dialog)
 * @param {Object} statements - Statement
 * @param {Array} statements.properties - The properties
 * @param {Array} statements.values - The values
 * @param {string} resourceId - The target resource ID
 * @param {boolean} syncBackend - Sync the prefill with the backend
 */
export const prefillStatements = ({ statements, resourceId, syncBackend = false }) => async (dispatch, getState) => {
    // properties
    for (const property of statements.properties) {
        dispatch(
            createProperty({
                propertyId: property.propertyId ? property.propertyId : guid(),
                existingPredicateId: property.existingPredicateId,
                resourceId: resourceId,
                label: property.label,
                range: property.range ? property.range : null,
                isTemplate: property.isTemplate ? property.isTemplate : false,
                validationRules: property.validationRules ? property.validationRules : {},
                minOccurs: property.minOccurs ? property.minOccurs : 0,
                maxOccurs: property.maxOccurs ? property.maxOccurs : null,
                isAnimated: property.isAnimated !== undefined ? property.isAnimated : false,
                canDuplicate: property.canDuplicate ? true : false
            })
        );
    }

    // values
    for (const value of statements.values) {
        /**
         * The resource ID of the value
         * @type {string}
         */
        let newObject = null;
        /**
         * The statement of the value
         * @type {string}
         */
        let newStatement = null;
        /**
         * The value ID in the statement browser
         * @type {string}
         */
        const valueId = guid();

        if (syncBackend) {
            const predicate = getState().statementBrowser.properties.byId[value.propertyId];
            if (value.existingResourceId) {
                // The value exist in the database
                newStatement = await createResourceStatement(resourceId, predicate.existingPredicateId, value.existingResourceId);
            } else {
                // The value doesn't exist in the database
                switch (value.type) {
                    case 'object':
                        newObject = await createResourceApi(value.label, value.classes ? value.classes : []);
                        newStatement = await createResourceStatement(resourceId, predicate.existingPredicateId, newObject.id);
                        break;
                    case 'property':
                        newObject = await createPredicate(value.label);
                        newStatement = await createResourceStatement(resourceId, predicate.existingPredicateId, newObject.id);
                        break;
                    default:
                        newObject = await createLiteral(value.label, value.datatype);
                        newStatement = await createLiteralStatement(resourceId, predicate.existingPredicateId, newObject.id);
                }
            }
        }

        dispatch(
            createValue({
                valueId: value.valueId ? value.valueId : valueId,
                label: value.label,
                type: value.type ? value.type : 'object',
                ...(value.type === 'literal' && { datatype: value.datatype ?? MISC.DEFAULT_LITERAL_DATATYPE }),
                propertyId: value.propertyId,
                existingResourceId: syncBackend && newObject ? newObject.id : value.existingResourceId ? value.existingResourceId : null,
                isExistingValue: syncBackend ? true : value.isExistingValue ? value.isExistingValue : false,
                classes: value.classes ? value.classes : [],
                statementId: newStatement ? newStatement.id : null
            })
        );
    }
};

export const toggleAbstractDialog = data => dispatch => {
    dispatch({
        type: type.TOGGLE_ABSTRACT_DIALOG
    });
};

export const setAbstractDialogView = data => dispatch => {
    dispatch({
        type: type.SET_ABSTRACT_DIALOG_VIEW,
        payload: {
            value: data
        }
    });
};

export const deleteContribution = data => dispatch => {
    dispatch({
        type: type.DELETE_CONTRIBUTION,
        payload: {
            id: data.id
        }
    });

    dispatch(selectContribution(data.selectAfterDeletion));
};

export const selectContribution = data => dispatch => {
    dispatch({
        type: type.SELECT_CONTRIBUTION,
        payload: {
            id: data.id
        }
    });

    dispatch({
        type: type.CLEAR_RESOURCE_HISTORY
    });

    dispatch(
        selectResource({
            increaseLevel: false,
            resourceId: data.resourceId,
            label: data.label,
            resetLevel: true
        })
    );
};

export const updateContributionLabel = data => dispatch => {
    dispatch({
        type: type.UPDATE_CONTRIBUTION_LABEL,
        payload: data
    });

    dispatch(updateContributionLabelInSB({ id: data.resourceId, label: data.label }));
};

export const updateResearchProblems = data => dispatch => {
    dispatch({
        type: type.UPDATE_RESEARCH_PROBLEMS,
        payload: data
    });
};

// The function to customize merging objects (to handle using the same existing predicate twice in the same ressource)
function customizer(objValue, srcValue) {
    if (isArray(objValue)) {
        return objValue.concat(srcValue);
    }
}

export const getResourceObject = (data, resourceId, newProperties) => {
    // Make a list of new resources ids
    const newResources = data.values.allIds
        .filter(valueId => !data.values.byId[valueId].isExistingValue)
        .map(valueId => data.values.byId[valueId].resourceId);
    return mergeWith(
        {},
        ...data.resources.byId[resourceId].propertyIds.map(propertyId => {
            const property = data.properties.byId[propertyId];
            return {
                // Map properties of resource
                /* Use the temp id from unique list of new properties */
                [property.existingPredicateId
                    ? property.existingPredicateId
                    : newProperties.find(p => p[property.label])[property.label]]: property.valueIds.map(valueId => {
                    const value = data.values.byId[valueId];
                    if (value.type === 'literal' && !value.isExistingValue) {
                        return {
                            text: value.label,
                            datatype: value.datatype
                        };
                    } else {
                        if (!value.isExistingValue) {
                            const newResources = {};
                            newResources[value.resourceId] = value.resourceId;
                            return {
                                '@temp': `_${value.resourceId}`,
                                label: value.label,
                                class: value.classes && value.classes.length > 0 ? value.classes[0] : null,
                                values: Object.assign({}, getResourceObject(data, value.resourceId, newProperties))
                            };
                        } else {
                            return {
                                '@id': newResources.includes(value.resourceId) ? `_${value.resourceId}` : value.resourceId
                            };
                        }
                    }
                })
            };
        }),
        customizer
    );
};

// Middleware function to transform frontend data to backend format
export const saveAddPaper = data => {
    return async dispatch => {
        const researchProblemPredicate = PREDICATES.HAS_RESEARCH_PROBLEM;
        // Get new properties (ensure that  no duplicate labels are in the new properties)
        let newProperties = data.properties.allIds.filter(propertyId => !data.properties.byId[propertyId].existingPredicateId);
        newProperties = newProperties.map(propertyId => ({ id: propertyId, label: data.properties.byId[propertyId].label }));
        newProperties = uniqBy(newProperties, 'label');
        newProperties = newProperties.map(property => ({ [property.label]: `_${property.id}` }));
        // list of new reaserch problems
        const newResearchProblem = [];
        const paperObj = {
            // Set new predicates label and temp ID
            predicates: newProperties,
            // Set the paper metadata
            paper: {
                title: data.title,
                doi: data.doi,
                authors: data.authors.map(author => ({ label: author.label, ...(author.orcid ? { orcid: author.orcid } : {}) })),
                publicationMonth: data.publicationMonth,
                publicationYear: data.publicationYear,
                publishedIn: data.publishedIn ? data.publishedIn : undefined,
                url: data.url,
                researchField: data.selectedResearchField,
                // Set the contributions data
                contributions: data.contributions.allIds.map(c => {
                    const contribution = data.contributions.byId[c];
                    const researhProblem = {
                        [researchProblemPredicate]: contribution.researchProblems.map(rp => {
                            if (rp.hasOwnProperty('existingResourceId') && rp.existingResourceId) {
                                return { '@id': rp.existingResourceId };
                            } else {
                                if (newResearchProblem.includes(rp.id)) {
                                    return { '@id': `_${rp.id}` };
                                } else {
                                    newResearchProblem.push(rp.id);
                                    return { label: rp.label, '@temp': `_${rp.id}` };
                                }
                            }
                        })
                    };
                    return {
                        name: contribution.label,
                        values: Object.assign({}, researhProblem, getResourceObject(data, contribution.resourceId, newProperties))
                    };
                })
            }
        };

        try {
            const paper = await saveFullPaper(paperObj);
            dispatch({
                type: type.SAVE_ADD_PAPER,
                id: paper.id
            });

            dispatch({
                type: type.ADD_PAPER_UNBLOCK_NAVIGATION
            });
        } catch (e) {
            console.log(e);
            toast.error('Something went wrong while saving this paper.');
            dispatch({
                type: type.ADD_PAPER_PREVIOUS_STEP
            });
        }
    };
};
