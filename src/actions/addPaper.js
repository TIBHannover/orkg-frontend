import * as type from './types.js';
import { guid } from '../utils';
import * as network from '../network';

export const updateGeneralData = (data) => dispatch => {
    dispatch({
        type: type.UPFATE_GENERAL_DATA,
        payload: data,
    })
}

export const nextStep = () => dispatch => {
    dispatch({
        type: type.ADD_PAPER_NEXT_STEP,
    })
}

export const previousStep = () => dispatch => {
    dispatch({
        type: type.ADD_PAPER_PREVIOUS_STEP,
    })
}

export const updateResearchField = (data) => dispatch => {
    dispatch({
        type: type.UPDATE_RESEARCH_FIELD,
        payload: data,
    })
}

export const createContribution = ({ selectAfterCreation = false }) => dispatch => {
    let newResourceId = guid();
    let newContributionId = guid();

    dispatch({
        type: type.CREATE_CONTRIBUTION,
        payload: {
            id: newContributionId,
            resourceId: newResourceId,
        }
    });

    if (selectAfterCreation) {
        dispatch({
            type: type.ADD_RESOURCE_HISTORY,
            payload: {
                resourceId: newResourceId,
                label: 'Main',
            }
        });
    }
}

export const deleteContribution = (id) => dispatch => {
    dispatch({
        type: type.DELETE_CONTRIBUTION,
        payload: {
            id
        }
    });

    dispatch(selectContribution());
}

export const selectContribution = (id) => dispatch => {

    dispatch({
        type: type.SELECT_CONTRIBUTION,
        payload: {
            id
        }
    });

    dispatch({
        type: type.CLEAR_RESOURCE_HISTORY
    });

    dispatch({
        type: type.CLEAR_SELECTED_PROPERTY
    });

    dispatch({
        type: type.ADD_RESOURCE_HISTORY,
        payload: {
            //resourceId: id,
            label: 'Main',
        }
    });

}

export const updateResearchProblems = (data) => dispatch => {
    dispatch({
        type: type.UPDATE_RESEARCH_PROBLEMS,
        payload: data
    })
}

export const togglePropertyCollapse = (id) => dispatch => {
    dispatch({
        type: type.TOGGLE_PROPERTY_COLLAPSE,
        id
    })
}

export const createProperty = (data) => dispatch => {
    dispatch({
        type: type.CREATE_PROPERTY,
        payload: {
            propertyId: data.propertyId ? data.propertyId : guid(),
            ...data,
        }
    })
}

export const deleteProperty = (data) => dispatch => {
    dispatch({
        type: type.DELETE_PROPERTY,
        payload: data
    })
}

export const createResource = (data) => dispatch => {
    dispatch({
        type: type.CREATE_RESOURCE,
        payload: {
            resourceId: data.resourceId ? data.resourceId : guid(),
            label: data.label,
            existingResourceId: data.existingResourceId
        }
    })
}

export const createValue = (data) => dispatch => {
    let resourceId = data.existingResourceId ? data.existingResourceId : (data.type === 'object' ? guid() : null);
    dispatch({
        type: type.CREATE_VALUE,
        payload: {
            valueId: data.valueId ? data.valueId : guid(),
            resourceId: resourceId,
            ...data,
        }
    })
}

export const deleteValue = (data) => dispatch => {
    dispatch({
        type: type.DELETE_VALUE,
        payload: data
    })
}

export const selectResource = (data) => dispatch => { // use redux thunk for async action, for capturing the resource properties 
    dispatch({
        type: type.SELECT_RESOURCE,
        payload: {
            increaseLevel: data.increaseLevel,
            resourceId: data.resourceId,
            label: data.label,
        }
    });

    dispatch({
        type: type.ADD_RESOURCE_HISTORY,
        payload: {
            resourceId: data.resourceId,
            label: data.label,
        }
    });

    dispatch({
        type: type.CLEAR_SELECTED_PROPERTY
    });
}

export const fetchStatementsForResource = (data) => {
    const { resourceId, existingResourceId } = data;

    return (dispatch) => {
        return network.getStatementsBySubject(existingResourceId)
            .then(
                response => {
                    let existingProperties = [];

                    for (let statement of response) {
                        let propertyId = guid();
                        const valueId = guid();

                        // check whether there already exist a property for this, then combine 
                        if (existingProperties.filter(e => e.existingPredicateId === statement.predicate.id).length === 0) {

                            dispatch(createProperty({
                                propertyId: propertyId,
                                resourceId: resourceId,
                                existingPredicateId: statement.predicate.id,
                                label: statement.predicate.label,
                                isExistingProperty: true,
                            }));

                            existingProperties.push({
                                existingPredicateId: statement.predicate.id,
                                propertyId,
                            });
                        } else {
                            propertyId = existingProperties.filter(e => e.existingPredicateId === statement.predicate.id)[0].propertyId;
                        }

                        dispatch(createValue({
                            valueId: valueId,
                            existingResourceId: statement.object.id,
                            propertyId: propertyId,
                            label: statement.object.label,
                            type: 'object',
                            isExistingValue: true
                        }));
                    }

                    dispatch({
                        type: type.SET_STATEMENT_IS_FECHTED,
                        resourceId: resourceId,
                    });
                },
                error => console.log('An error occurred.', error)
            )
    }
}

export const goToResourceHistory = (data) => dispatch => {
    dispatch({
        type: type.GOTO_RESOURCE_HISTORY,
        payload: data
    });

    dispatch({
        type: type.CLEAR_SELECTED_PROPERTY
    });
}

// Middleware function to transform frontend data to backend format 
// TODO: in order to minimize the amount of requests to the backend, it would be better to make this one backend 
// call that is replaces all the individual requests (backend change is needed for this)
export const saveAddPaper = (data) => {
    return async (dispatch) => {
        const doiPredicate = process.env.REACT_APP_PREDICATES_HAS_DOI;
        const authorPredicate = process.env.REACT_APP_PREDICATES_HAS_AUTHOR;
        const publicationMonthPredicate = process.env.REACT_APP_PREDICATES_HAS_PUBLICATION_MONTH;
        const publicationYearPredicate = process.env.REACT_APP_PREDICATES_HAS_PUBLICATION_YEAR;
        const researchFieldPredicate = process.env.REACT_APP_PREDICATES_HAS_RESEARCH_FIELD;
        const contributionPredicate = process.env.REACT_APP_PREDICATES_HAS_CONTRIBUTION;
        const researchProblemPredicate = process.env.REACT_APP_PREDICATES_HAS_RESEARCH_PROBLEM;

        // title
        let paper = await network.createResource(data.title);

        // DOI
        let doi = await network.createLiteral(data.doi);
        await network.createLiteralStatement(paper.id, doiPredicate, doi.id);

        // authors
        for (let author of data.authors) {
            let authorResource = await network.createResource(author);
            await network.createResourceStatement(paper.id, authorPredicate, authorResource.id);
        }

        // publication month
        let publicationMonth = await network.createResource(data.publicationMonth);
        await network.createResourceStatement(paper.id, publicationMonthPredicate, publicationMonth.id);

        // publication year
        let publicationYear = await network.createResource(data.publicationYear);
        await network.createResourceStatement(paper.id, publicationYearPredicate, publicationYear.id);

        // research field
        await network.createResourceStatement(paper.id, researchFieldPredicate, data.selectedResearchField);

        // contributions
        for (let [key, contribution] of Object.entries(data.contributions)) {
            let contributionResource = await network.createResource('contribution');
            await network.createResourceStatement(paper.id, contributionPredicate, contributionResource.id);

            // set the id of the just created contribution for the related resource 
            data.resources.byId[contribution.resourceId].existingResourceId = contributionResource.id;

            // research problems
            if (contribution.researchProblems && contribution.researchProblems.length > 0) {
                for (let researchProblem of contribution.researchProblems) {
                    let researchProblemResource = await network.createResource(researchProblem);
                    await network.createResourceStatement(contributionResource.id, researchProblemPredicate, researchProblemResource.id);
                }
            }
        }

        // statements
        // resources
        if (data.resources.byId) {
            for (let [key, resource] of Object.entries(data.resources.byId)) {
                let resourceId;

                if (!resource.existingResourceId) {
                    resourceId = await network.createResource(resource.label);
                    resourceId = resourceId.id;
                } else {
                    resourceId = resource.existingResourceId;
                }

                // predicates
                if (resource.propertyIds && resource.propertyIds.length > 0) {
                    for (let propertyId of resource.propertyIds) {
                        let property = data.properties.byId[propertyId];
                        
                        let predicateId;

                        if (!property.existingPredicateId) {
                            predicateId = await network.createPredicate(property.label);
                            predicateId = predicateId.id;
                        } else {
                            predicateId = property.existingPredicateId;
                        }

                        // objects/values
                        if (property.valueIds && property.valueIds.length > 0) {
                            for (let valueId of property.valueIds) {
                                let value = data.values.byId[valueId];
                                
                                if (value.type === 'literal') {
                                    let newValueId = await network.createLiteral(value.label);
                                    newValueId = newValueId.id;
                                    await network.createLiteralStatement(resourceId, predicateId, newValueId);
                                } else {
                                    let newValueId;

                                    if (!value.isExistingValue) {
                                        newValueId = await network.createResource(value.label);
                                        newValueId = newValueId.id;
                                    } else {
                                        newValueId = value.resourceId;
                                    }

                                    await network.createResourceStatement(resourceId, predicateId, newValueId);
                                }                               
                            }
                        }
                    }
                }
            }
        }

        dispatch({
            type: type.SAVE_ADD_PAPER,
            id: paper.id,
        });
    }
}