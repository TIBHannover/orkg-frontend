/**
 * Services file for the annotation service
 * https://gitlab.com/TIBHannover/orkg/annotation
 */

import env from '@beam-australia/react-env';
import { PREDICATES } from 'constants/graphSettings';
import { keyBy, mapValues, uniq } from 'lodash';
import { submitPostRequest, submitPutRequest } from 'network';
import { getPredicate } from 'services/backend/predicates';
import { getResources } from 'services/backend/resources';
import { guid } from 'utils';

export const annotationServiceUrl = env('ANNOTATION_SERVICE_URL');

export const getAnnotations = abstract =>
    submitPostRequest(`${annotationServiceUrl}annotator/`, { 'Content-Type': 'application/json' }, { text2annotate: abstract });

export const classifySentence = ({ sentence, labels }) => {
    const headers = {
        'Content-Type': 'application/json',
    };

    const data = {
        sentence,
        labels,
    };

    return submitPutRequest(`${annotationServiceUrl}classifySentence/`, headers, data);
};

export const summarizeText = ({ text, ratio }) => {
    const headers = {
        'Content-Type': 'text/plain',
    };

    return submitPutRequest(`${annotationServiceUrl}summarizeText/?ratio=${ratio}`, headers, text, false);
};

export const getNerResults = async ({ title = '', abstract = '' }) => {
    // TODO: update with new NER service URI
    const data = await submitPostRequest('https://orkg.org/nlp/api/annotation/csner', { 'Content-Type': 'application/json' }, { title, abstract });
    const titleConcepts = mapValues(keyBy(data.payload.annotations.title, 'concept'), 'entities');
    const abstractConcepts = mapValues(keyBy(data.payload.annotations.abstract, 'concept'), 'entities');

    const propertyMapping = {
        RESEARCH_PROBLEM: PREDICATES.HAS_RESEARCH_PROBLEM,
        METHOD: PREDICATES.METHOD,
        LANGUAGE: PREDICATES.LANGUAGE,
        RESOURCE: PREDICATES.RESOURCE,
        TOOL: PREDICATES.TOOL,
        SOLUTION: PREDICATES.SOLUTION,
        DATASET: PREDICATES.HAS_DATASET,
    };

    const mappedEntities = {};
    const mappedResourcePromises = [];

    for (const type of Object.keys(propertyMapping)) {
        const resources = uniq([...(titleConcepts?.[type] || []), ...(abstractConcepts?.[type] || [])]);
        mappedResourcePromises.push(
            ...resources.map(resource => ({ type, label: resource, data: getResources({ q: resource, exact: true, returnContent: true }) })),
        );
    }

    const resources = await Promise.all(mappedResourcePromises.map(promise => promise.data));

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
                isExistingValue: false,
            };
        }
        mappedEntities[propertyMapping[mappedResourcePromises[index].type]].push(resource);
    }

    const propertyPromises = Object.keys(mappedEntities).map(propertyId => getPredicate(propertyId));
    let properties = await Promise.all(propertyPromises);
    properties = keyBy(properties, 'id');

    return { resources: mappedEntities, properties };
};

export const saveFeedback = async ({ request, response, serviceName }) =>
    submitPostRequest(
        'https://orkg.org/nlp/api/feedback/',
        { 'Content-Type': 'application/json' },
        { feedback: { request, response, service_name: serviceName } },
    );
