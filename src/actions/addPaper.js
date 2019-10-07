import * as network from '../network';
import * as type from './types.js';
import { guid } from '../utils';
import { createResource, selectResource, createProperty, createValue } from './statementBrowser';

export const updateGeneralData = (data) => (dispatch) => {
  dispatch({
    type: type.UPFATE_GENERAL_DATA,
    payload: data,
  });
};

export const nextStep = () => (dispatch) => {
  dispatch({
    type: type.ADD_PAPER_NEXT_STEP,
  });
};

export const previousStep = () => (dispatch) => {
  dispatch({
    type: type.ADD_PAPER_PREVIOUS_STEP,
  });
};

export const blockNavigation = () => (dispatch) => {
  dispatch({
    type: type.ADD_PAPER_BLOCK_NAVIGATION,
  });
};

export const updateResearchField = (data) => (dispatch) => {
  dispatch({
    type: type.UPDATE_RESEARCH_FIELD,
    payload: data,
  });
};

export const updateTourCurrentStep = (data) => (dispatch) => {
  dispatch({
    type: type.UPDATE_TOUR_CURRENT_STEP,
    payload: data,
  });
};

export const closeTour = () => dispatch => {
  dispatch({
    type: type.CLOSE_TOUR,
  })
}

export const openTour = (step) => dispatch => {
  dispatch({
    type: type.OPEN_TOUR,
    payload: {
      step: step ? step : 0,
    },
  })
}

export const updateAbstract = (data) => (dispatch) => {
  dispatch({
    type: type.UPDATE_ABSTRACT,
    payload: data,
  });
};

export const createAnnotation = (data) => (dispatch) => {
  dispatch({
    type: type.CREATE_ANNOTATION,
    payload: {
      id: guid(),
      ...data,
    }
  });
};

export const removeAnnotation = (data) => (dispatch) => {
  dispatch({
    type: type.REMOVE_ANNOTATION,
    payload: data,
  });
};

export const validateAnnotation = (data) => (dispatch) => {
  dispatch({
    type: type.VALIDATE_ANNOTATION,
    payload: data,
  });
};

export const updateAnnotationClass = (data) => (dispatch) => {
  dispatch({
    type: type.UPDATE_ANNOTATION_CLASS,
    payload: data,
  });
};

export const clearAnnotations = () => (dispatch) => {
  dispatch({
    type: type.CLEAR_ANNOTATIONS
  });
};

export const createContribution = ({ selectAfterCreation = false, prefillStatements: performPrefill = false, statements = null }) => (dispatch) => {
  let newResourceId = guid();
  let newContributionId = guid();

  dispatch({
    type: type.CREATE_CONTRIBUTION,
    payload: {
      id: newContributionId,
      resourceId: newResourceId,
    },
  });

  dispatch(
    createResource({
      resourceId: newResourceId,
    }),
  );

  if (selectAfterCreation) {
    dispatch(
      selectResource({
        increaseLevel: false,
        resourceId: newResourceId,
        label: 'Main',
      }),
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
        resourceId: newResourceId,
      }),
    );
  }
};

export const prefillStatements = ({ statements, resourceId }) => (dispatch) => {
  // properties
  for (let property of statements.properties) {
    dispatch(
      createProperty({
        propertyId: property.propertyId,
        existingPredicateId: property.existingPredicateId,
        resourceId: resourceId,
        label: property.label,
      }),
    );
  }

  // values
  for (let value of statements.values) {
    dispatch(
      createValue({
        label: value.label,
        type: 'object',
        propertyId: value.propertyId,
      }),
    );
  }

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
};

export const deleteContribution = (data) => (dispatch) => {
  dispatch({
    type: type.DELETE_CONTRIBUTION,
    payload: {
      id: data.id,
    },
  });

  dispatch(selectContribution(data.selectAfterDeletion));
};

export const selectContribution = (data) => (dispatch) => {
  dispatch({
    type: type.SELECT_CONTRIBUTION,
    payload: {
      id: data.id,
    },
  });

  dispatch({
    type: type.CLEAR_RESOURCE_HISTORY,
  });

  dispatch(
    selectResource({
      increaseLevel: false,
      resourceId: data.resourceId,
      label: 'Main',
      resetLevel: true,
    }),
  );
};

export const updateContributionLabel = (data) => (dispatch) => {
  dispatch({
    type: type.UPDATE_CONTRIBUTION_LABEL,
    payload: data,
  });
};

export const updateResearchProblems = (data) => (dispatch) => {
  dispatch({
    type: type.UPDATE_RESEARCH_PROBLEMS,
    payload: data,
  });
};

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
    let paper = await network.createResource(data.title, [process.env.REACT_APP_CLASSES_PAPER]);

    // DOI
    if (data.doi) {
      let doi = await network.createLiteral(data.doi);
      await network.createLiteralStatement(paper.id, doiPredicate, doi.id);
    }

    // authors
    for (let author of data.authors) {
      // check if the author is already a resource
      if (author.hasOwnProperty('_class') && author._class === 'resource') {
        await network.createResourceStatement(paper.id, authorPredicate, author.id);
      } else {
        if (author.label) {
          let authorResource = await network.createResource(author.label);
          await network.createResourceStatement(paper.id, authorPredicate, authorResource.id);
        }
      }
    }

    if (data.publicationMonth) {
      // publication month
      let publicationMonth = await network.createResource(data.publicationMonth);
      await network.createResourceStatement(paper.id, publicationMonthPredicate, publicationMonth.id);
    }

    if (data.publicationYear) {
      // publication year
      let publicationYear = await network.createResource(data.publicationYear);
      await network.createResourceStatement(paper.id, publicationYearPredicate, publicationYear.id);
    }

    // research field
    await network.createResourceStatement(paper.id, researchFieldPredicate, data.selectedResearchField);

    let contributionIds = [];
    // contributions
    for (let contributionId of data.contributions.allIds) {
      let contribution = data.contributions.byId[contributionId];
      let contributionResource = await network.createResource(contribution.label);
      await network.createResourceStatement(paper.id, contributionPredicate, contributionResource.id);

      contributionIds.push(contributionResource.id);

      // set the id of the just created contribution for the related resource
      data.resources.byId[contribution.resourceId].existingResourceId = contributionResource.id;
      data.resources.byId[contribution.resourceId].partOfContribution = true;

      // research problems
      if (contribution.researchProblems && contribution.researchProblems.length > 0) {
        for (let researchProblem of contribution.researchProblems) {
          // check if the research problem is already a resource
          if (researchProblem.hasOwnProperty('_class') && researchProblem._class === 'resource') {
            await network.createResourceStatement(contributionResource.id, researchProblemPredicate, researchProblem.id);
          } else {
            let researchProblemResource = await network.createResource(researchProblem.id);
            await network.createResourceStatement(contributionResource.id, researchProblemPredicate, researchProblemResource.id);
          }
        }
      }
    }

    await saveStatements(data);

    for (let contributionId of contributionIds) {
      // index contribution for similarity
      network.indexContribution(contributionId);
    }

    dispatch({
      type: type.SAVE_ADD_PAPER,
      id: paper.id,
    });

    dispatch({
      type: type.ADD_PAPER_UNBLOCK_NAVIGATION
    });
  };
};

// Maybe this function needs to be resursive
export const saveStatements = async (data) => {
  let newProperties = {};
  let newResources = {};

  if (data.resources.byId) {
    for (let resourceIdArray of data.resources.allIds) { // the order matters here, since it is an hierarch, the object doesn't provide a reliable order (so use the array)
      let resource = data.resources.byId[resourceIdArray];
      let resourceId;

      if (!resource.existingResourceId) {
        resourceId = await network.createResource(resource.label);
        resourceId = resourceId.id;
        data.resources.byId[resourceIdArray].existingResourceId = resourceId;
      } else {
        resourceId = resource.existingResourceId;
      }

      // predicates
      if (resource.propertyIds && resource.propertyIds.length > 0) {
        for (let propertyId of resource.propertyIds) {
          let property = data.properties.byId[propertyId];

          let predicateId;

          if (!property.existingPredicateId && !newProperties[property.label]) {
            predicateId = await network.createPredicate(property.label);
            predicateId = predicateId.id;

            newProperties[property.label] = predicateId; // add to the newProperties object, so the ID can be used for other new labels
          } else if (newProperties[property.label]) {
            predicateId = newProperties[property.label];
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
                  newResources[value.resourceId] = newValueId;
                } else if (newResources[value.resourceId]) {
                  newValueId = newResources[value.resourceId];
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
};
