import * as type from './types.js';
import { guid } from '../utils';
import * as network from '../network';
import {createResource, selectResource} from './statementBrowser';

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

export const updateAbstract = (data) => dispatch => {
    dispatch({
        type: type.UPDATE_ABSTRACT,
        payload: data,
    })
}

export const createContribution = ({ selectAfterCreation = false, prefillStatements: performPrefill = false, researchField = null }) => dispatch => {
    let newResourceId = guid();
    let newContributionId = guid();

    dispatch({
        type: type.CREATE_CONTRIBUTION,
        payload: {
            id: newContributionId,
            resourceId: newResourceId,
        }
    });

    dispatch(createResource({
        resourceId: newResourceId
    }));

    if (selectAfterCreation) {
        dispatch(selectResource({
            increaseLevel: false,
            resourceId: newResourceId,
            label: 'Main',
        }));

        /*dispatch({
            type: type.ADD_RESOURCE_HISTORY,
            payload: {
                resourceId: newResourceId,
                label: 'Main',
            }
        });*/
    }

    if (performPrefill) {
        dispatch(prefillStatements({
            researchField,
            resourceId: newResourceId
        }));
    }
}

export const prefillStatements = ({ researchField, resourceId }) => dispatch => {
    // TODO: when no match is found, look for the parent researchField

    // This data is only added for demo purposes 
    /*if (researchField === 'R133') {
        dispatch(createProperty({
            resourceId: resourceId,
            existingPredicateId: 'P63',
            label: 'Approach',
        }));

        dispatch(createProperty({
            resourceId: resourceId,
            existingPredicateId: 'P58',
            label: 'Evaluation',
        }));

        dispatch(createProperty({
            resourceId: resourceId,
            existingPredicateId: 'P16',
            label: 'Implementation',
        }));
    }*/
}

export const deleteContribution = (id) => dispatch => {
    dispatch({
        type: type.DELETE_CONTRIBUTION,
        payload: {
            id
        }
    });

    dispatch(selectContribution({id : null}));
}

export const selectContribution = (data) => dispatch => {

    dispatch({
        type: type.SELECT_CONTRIBUTION,
        payload: {
            id: data.id
        }
    });

    dispatch({
        type: type.CLEAR_RESOURCE_HISTORY
    });

    dispatch(selectResource({
        increaseLevel: false,
        resourceId: data.resourceId,
        label: 'Main',
        resetLevel: true,
    }));
}

export const updateContributionLabel = (data) => dispatch => {
    dispatch({
        type: type.UPDATE_CONTRIBUTION_LABEL,
        payload: data
    })
}

export const updateResearchProblems = (data) => dispatch => {
    dispatch({
        type: type.UPDATE_RESEARCH_PROBLEMS,
        payload: data
    })
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
        const isAPredicate = process.env.REACT_APP_PREDICATES_IS_A;
        const paperResource = process.env.REACT_APP_RESOURCE_TYPES_PAPER;

        // title
        let paper = await network.createResource(data.title);

        // set resource type to paper 
        await network.createResourceStatement(paper.id, isAPredicate, paperResource);

        // DOI
        let doi = await network.createLiteral(data.doi);
        await network.createLiteralStatement(paper.id, doiPredicate, doi.id);

        // authors
        for (let author of data.authors) {
            // check if the author is already a resource
            if (author.hasOwnProperty('_class') && author._class === 'resource'){
                await network.createResourceStatement(paper.id, authorPredicate, author.id);
            }else{
                let authorResource = await network.createResource(author.label);
                await network.createResourceStatement(paper.id, authorPredicate, authorResource.id);
            }
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
        for (let contributionId of data.contributions.allIds) {
            let contribution = data.contributions.byId[contributionId];
            let contributionResource = await network.createResource(contribution.label);
            await network.createResourceStatement(paper.id, contributionPredicate, contributionResource.id);

            // set the id of the just created contribution for the related resource 
            data.resources.byId[contribution.resourceId].existingResourceId = contributionResource.id;
            data.resources.byId[contribution.resourceId].partOfContribution = true;


            // research problems
            if (contribution.researchProblems && contribution.researchProblems.length > 0) {
                for (let researchProblem of contribution.researchProblems) {
                    // check if the research problem is already a resource
                    if (researchProblem.hasOwnProperty('_class') && researchProblem._class === 'resource'){
                        await network.createResourceStatement(contributionResource.id, researchProblemPredicate, researchProblem.id);
                    }else{
                        let researchProblemResource = await network.createResource(researchProblem.id);
                        await network.createResourceStatement(contributionResource.id, researchProblemPredicate, researchProblemResource.id);
                    }
                }
            }
        }

        await saveStatements(data);

        network.setupSimilarity();

        dispatch({
            type: type.SAVE_ADD_PAPER,
            id: paper.id,
        });
    }
}

// Maybe this function needs to be resursive
export const saveStatements = async (data) => {
    if (data.resources.byId) {
        //for (let [key, resource] of Object.entries(data.resources.byId)) {
        for (let resourceIdArray of data.resources.allIds) { // the order matters here, since it is an hierarch, the object doesn't provide a reliable order (so use the array)
            let resource = data.resources.byId[resourceIdArray];
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

                            if (value.type === 'literal' && !value.isExistingValue) {
                                let newValueId = await network.createLiteral(value.label);
                                newValueId = newValueId.id;

                                await network.createLiteralStatement(resourceId, predicateId, newValueId);
                            } else {
                                let newValueId;

                                if (!value.isExistingValue) {
                                    newValueId = await network.createResource(value.label);
                                    newValueId = newValueId.id;
                                    data.resources.byId[value.resourceId].existingResourceId = newValueId;
                                } else {
                                    newValueId = value.resourceId;
                                }

                                if (!value.existingStatement) {
                                    await network.createResourceStatement(resourceId, predicateId, newValueId);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}