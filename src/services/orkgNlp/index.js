/**
 * Services file for the NLP service
 * https://gitlab.com/TIBHannover/orkg/nlp/orkg-nlp-api
 */

import env from '@beam-australia/react-env';
import { PREDICATES } from 'constants/graphSettings';
import { keyBy, mapValues, uniq } from 'lodash';
import { submitPostRequest } from 'network';
import { getPredicate } from 'services/backend/predicates';
import { getResources } from 'services/backend/resources';
import { guid } from 'utils';

export const nlpServiceUrl = env('NLP_SERVICE_URL');

export const classifySentence = async ({ sentence, labels }) => {
    const { payload } = await submitPostRequest(
        `${nlpServiceUrl}tools/text/classify`,
        {
            'Content-Type': 'application/json',
        },
        {
            sentence,
            labels,
        },
    );
    return payload;
};

export const summarizeText = ({ text, ratio }) => {
    const { payload } = submitPostRequest(
        `${nlpServiceUrl}tools/text/summarize`,
        {
            'Content-Type': 'text/plain',
        },
        { text, ratio },
        false,
    );
    return payload;
};

export const getNerResults = async ({ title = '', abstract = '' }) => {
    const data = await submitPostRequest(`${nlpServiceUrl}annotation/csner`, { 'Content-Type': 'application/json' }, { title, abstract });
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
    properties = keyBy(
        properties.map(property => ({
            ...property,
            concept: Object.keys(propertyMapping).find(key => propertyMapping[key] === property.id),
        })),
        'id',
    );
    /**/

    return { resources: mappedEntities, properties, response: data.payload.annotations };
};

export const saveFeedback = async ({ request, response, serviceName }) =>
    submitPostRequest(
        `${nlpServiceUrl}feedback`,
        { 'Content-Type': 'application/json' },
        { feedback: { request, response, service_name: serviceName } },
    );
