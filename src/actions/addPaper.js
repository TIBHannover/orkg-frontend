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

export const resourceFactory = (data, resourceId) => {
  return data.resources.byId[resourceId].propertyIds.map(propertyId => {
    let property = data.properties.byId[propertyId];
    return {
      [property.existingPredicateId ? property.existingPredicateId : `_${propertyId}`]: property.valueIds.map((valueId => {
        let value = data.values.byId[valueId];
        if (value.type === 'literal' && !value.isExistingValue) {
          return {
            '@id': value.id,
            'text': value.label,
          }
        } else {
          if (!value.isExistingValue) {
            return {
              '@temp': `_${value.resourceId}`,
              'label': value.label,
              'values': { ...Object.assign({}, ...resourceFactory(data, value.resourceId)) }
            }
          } else {
            return {
              '@id': value.resourceId,
            }
          }
        }
      }))
    }
  })
}

// Middleware function to transform frontend data to backend format
// TODO: in order to minimize the amount of requests to the backend, it would be better to make this one backend
// call that is replaces all the individual requests (backend change is needed for this)
export const saveAddPaper = (data) => {
  return async (dispatch) => {
    const researchProblemPredicate = process.env.REACT_APP_PREDICATES_HAS_RESEARCH_PROBLEM;

    let paperObj = {
      'predicates': data.properties.allIds.filter(propertyId => {
        let property = data.properties.byId[propertyId];
        if (property.existingPredicateId) {
          return false;
        } else {
          return true;
        }
      }).map(propertyId => {
        let property = data.properties.byId[propertyId];
        return {
          [property.label]: `_${propertyId}`
        }
      }),
      'paper': {
        'title': data.title,
        'doi': data.doi,
        'authors': data.authors.map(author => ({ label: author.label })),
        'publicationMonth': data.publicationMonth,
        'publicationYear': data.publicationYear,
        'researchField': data.selectedResearchField,
        'contributions': data.contributions.allIds.map(c => {
          let contribution = data.contributions.byId[c];
          let researhProblem = {
            [researchProblemPredicate]: contribution.researchProblems.map(rp => {
              if (rp.hasOwnProperty('_class') && rp._class === 'resource') {
                return { label: rp.label, '@id': rp.id }
              } else {
                return { label: rp.label }
              }
            })
          }
          return {
            'name': contribution.label,
            'values': Object.assign({}, researhProblem, ...resourceFactory(data, contribution.resourceId))
          }
        })
      }
    }

    let paper = await network.saveFullPaper(paperObj);

    dispatch({
      type: type.SAVE_ADD_PAPER,
      id: paper.id,
    });

    dispatch({
      type: type.ADD_PAPER_UNBLOCK_NAVIGATION
    });
  };
};