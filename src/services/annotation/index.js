/**
 * Services file for the annotation service
 * https://gitlab.com/TIBHannover/orkg/annotation
 */

import { submitPostRequest, submitPutRequest } from 'network';
import env from '@beam-australia/react-env';
import { PREDICATES } from 'constants/graphSettings';
import { getResources } from 'services/backend/resources';
import { guid } from 'utils';

export const annotationServiceUrl = env('ANNOTATION_SERVICE_URL');

export const getAnnotations = abstract => {
    return submitPostRequest(`${annotationServiceUrl}annotator/`, { 'Content-Type': 'application/json' }, { text2annotate: abstract });
};

export const classifySentence = ({ sentence, labels }) => {
    const headers = {
        'Content-Type': 'application/json'
    };

    const data = {
        sentence,
        labels
    };

    return submitPutRequest(`${annotationServiceUrl}classifySentence/`, headers, data);
};

export const summarizeText = ({ text, ratio }) => {
    const headers = {
        'Content-Type': 'text/plain'
    };

    return submitPutRequest(`${annotationServiceUrl}summarizeText/?ratio=${ratio}`, headers, text, false);
};

export const getNerResults = async ({ title = '', abstract = '' }) => {
    const propertyMapping = {
        RESEARCH_PROBLEM: PREDICATES.HAS_RESEARCH_PROBLEM,
        METHOD: PREDICATES.HAS_METHOD,
        LANGUAGE: PREDICATES.HAS_LANGUAGE
    };

    // dummy data
    // TOOD: capitalize the first letter of each resource
    const entities = {
        RESEARCH_PROBLEM: ['Statistical machine translation', 'POS', 'GermanEnglish translation task', 'non-existing resource'],
        LANGUAGE: ['Filipino'],
        METHOD: ['Probabilistic Approaches']
    };

    const mappedEntities = {};
    const mappedResourcePromises = [];
    for (const [type, resources] of Object.entries(entities)) {
        if (!propertyMapping[type]) {
            continue;
        }
        mappedResourcePromises.push(
            ...resources.map(resource => ({ type, label: resource, data: getResources({ q: resource, exact: true, returnContent: true }) }))
        );
    }

    await Promise.all(mappedResourcePromises.map(promise => promise.data)).then(resources => {
        for (const [index, resourceResults] of resources.entries()) {
            if (!mappedEntities[propertyMapping[mappedResourcePromises[index].type]]) {
                mappedEntities[propertyMapping[mappedResourcePromises[index].type]] = [];
            }
            let resource;
            if (resourceResults.length > 0) {
                resource = { ...resourceResults[0], isExistingValue: true };
            } else {
                resource = {
                    id: guid(),
                    label: mappedResourcePromises[index].label,
                    isExistingValue: false
                };
            }
            mappedEntities[propertyMapping[mappedResourcePromises[index].type]].push(resource);
        }
    });

    return mappedEntities;
};
