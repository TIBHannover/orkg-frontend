import * as type from './types.js';
import { guid } from 'utils';
import { mergeWith, isArray, uniqBy } from 'lodash';
import {
    createResourceAction as createResource,
    selectResourceAction as selectResource,
    loadStatementBrowserData,
    fetchTemplatesOfClassIfNeeded,
    updateContributionLabel as updateContributionLabelInSB,
    clearResourceHistory,
    fillStatements
} from 'slices/statementBrowserSlice';
import { saveFullPaper } from 'services/backend/papers';
import { toast } from 'react-toastify';
import { CLASSES } from 'constants/graphSettings';

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

export const createContribution = ({ selectAfterCreation = false, fillStatements: performPrefill = false, statements = null }) => (
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
            label: newContributionLabel,
            classes: [CLASSES.CONTRIBUTION]
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

    // Dispatch loading template of classes
    dispatch(fetchTemplatesOfClassIfNeeded(CLASSES.CONTRIBUTION));

    if (performPrefill && statements) {
        dispatch(
            fillStatements({
                statements,
                resourceId: newResourceId
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

    dispatch(clearResourceHistory());

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

// The function to customize merging objects (to handle using the same existing predicate twice in the same resource)
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
                    if (value._class === 'literal' && !value.isExistingValue) {
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
                                classes: value.classes && value.classes.length > 0 ? value.classes : null,
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
        // Get new properties (ensure that  no duplicate labels are in the new properties)
        let newProperties = data.properties.allIds.filter(propertyId => !data.properties.byId[propertyId].existingPredicateId);
        newProperties = newProperties.map(propertyId => ({ id: propertyId, label: data.properties.byId[propertyId].label }));
        newProperties = uniqBy(newProperties, 'label');
        newProperties = newProperties.map(property => ({ [property.label]: `_${property.id}` }));
        const paperObj = {
            // Set new predicates label and temp ID
            predicates: newProperties,
            // Set the paper metadata
            paper: {
                title: data.title,
                doi: data.doi,
                authors: data.authors.map(author => ({
                    label: author.label,
                    ...(author.label !== author.id ? { id: author.id } : {}),
                    ...(author.orcid ? { orcid: author.orcid } : {})
                })),
                publicationMonth: data.publicationMonth,
                publicationYear: data.publicationYear,
                publishedIn: data.publishedIn ? data.publishedIn : undefined,
                url: data.url,
                researchField: data.selectedResearchField,
                // Set the contributions data
                contributions: data.contributions.allIds.map(c => {
                    const contribution = data.contributions.byId[c];
                    return {
                        name: contribution.label,
                        classes:
                            data.resources.byId[contribution.resourceId].classes && data.resources.byId[contribution.resourceId].classes.length > 0
                                ? data.resources.byId[contribution.resourceId].classes
                                : null,
                        values: Object.assign({}, getResourceObject(data, contribution.resourceId, newProperties))
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
