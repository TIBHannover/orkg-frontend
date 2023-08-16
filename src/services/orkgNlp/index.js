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
import { getParentResearchFields } from 'services/backend/statements';
import { COMPUTER_SCIENCE_FIELDS_LIST, AGRICULTURE_FIELDS_LIST } from 'constants/nlpFieldLists';
import fetch from 'cross-fetch';

export const nlpServiceUrl = env('NLP_SERVICE_URL');

// https://gitlab.com/TIBHannover/orkg/nlp/orkg-nlp-api/-/blob/main/app/__init__.py#L13
export const SERVICE_MAPPING = {
    PREDICATES_CLUSTERING: 'PREDICATES_CLUSTERING',
    BIOASSAYS_SEMANTIFICATION: 'BIOASSAYS_SEMANTIFICATION',
    CS_NER: 'CS_NER',
    AGRI_NER: 'AGRI_NER',
    TABLE_EXTRACTION: 'TABLE_EXTRACTION',
    PDF_CONVERSION: 'PDF_CONVERSION',
    TEXT_SUMMARIZATION: 'TEXT_SUMMARIZATION',
    TEXT_CLASSIFICATION: 'TEXT_CLASSIFICATION',
};

export const FIELDS_SERVICES_MAPPING = {
    [SERVICE_MAPPING.CS_NER]: COMPUTER_SCIENCE_FIELDS_LIST,
    [SERVICE_MAPPING.AGRI_NER]: AGRICULTURE_FIELDS_LIST,
};

export const determineActiveNERService = async field => {
    if (!field) return null;
    let result = Object.keys(FIELDS_SERVICES_MAPPING).map(key => FIELDS_SERVICES_MAPPING[key].includes(field));
    if (result.indexOf(true) === -1) {
        const parentFields = await getParentResearchFields(field);
        result = Object.keys(FIELDS_SERVICES_MAPPING).map(key => parentFields.some(_field => FIELDS_SERVICES_MAPPING[key].includes(_field.id)));
    }
    let activeNerService = null;
    try {
        activeNerService = Object.keys(FIELDS_SERVICES_MAPPING)[result.indexOf(true)];
    } catch {
        activeNerService = null;
    }
    return activeNerService;
};

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

export const PROPERTY_MAPPING = {
    RESEARCH_PROBLEM: PREDICATES.HAS_RESEARCH_PROBLEM,
    METHOD: PREDICATES.METHOD,
    LANGUAGE: PREDICATES.LANGUAGE,
    RESOURCE: PREDICATES.RESOURCE,
    TOOL: PREDICATES.TOOL,
    SOLUTION: PREDICATES.SOLUTION,
    DATASET: PREDICATES.HAS_DATASET,
};

export const getNerResults = async ({ title = '', abstract = '', service = SERVICE_MAPPING.CS_NER }) => {
    let data = null;
    let titleConcepts = null;
    let abstractConcepts = null;
    if (service === SERVICE_MAPPING.CS_NER) {
        data = await submitPostRequest(`${nlpServiceUrl}annotation/csner`, { 'Content-Type': 'application/json' }, { title, abstract });
        titleConcepts = mapValues(keyBy(data.payload.annotations.title, 'concept'), 'entities');
        abstractConcepts = mapValues(keyBy(data.payload.annotations.abstract, 'concept'), 'entities');
    } else {
        data = await submitPostRequest(`${nlpServiceUrl}annotation/agriner`, { 'Content-Type': 'application/json' }, { title });
        titleConcepts = mapValues(keyBy(data.payload.annotations, 'concept'), 'entities');
    }

    const mappedEntities = {};
    const mappedResourcePromises = [];

    for (const type of Object.keys(PROPERTY_MAPPING)) {
        const resources = uniq([...(titleConcepts?.[type] || []), ...(abstractConcepts?.[type] || [])]);
        mappedResourcePromises.push(
            ...resources.map(resource => ({ type, label: resource, data: getResources({ q: resource, exact: true, returnContent: true }) })),
        );
    }

    const resources = await Promise.all(mappedResourcePromises.map(promise => promise.data));

    for (const [index, resourceResults] of resources.entries()) {
        if (!mappedEntities[PROPERTY_MAPPING[mappedResourcePromises[index].type]]) {
            mappedEntities[PROPERTY_MAPPING[mappedResourcePromises[index].type]] = [];
        }
        let resource;
        if (resourceResults.length > 0) {
            resource = { ...resourceResults[0], isExistingValue: true };
        } else {
            resource = {
                label: mappedResourcePromises[index].label,
                isExistingValue: false,
            };
        }
        mappedEntities[PROPERTY_MAPPING[mappedResourcePromises[index].type]].push(resource);
    }

    const propertyPromises = Object.keys(mappedEntities).map(propertyId => getPredicate(propertyId));
    let properties = await Promise.all(propertyPromises);
    properties = keyBy(
        properties.map(property => ({
            ...property,
            concept: Object.keys(PROPERTY_MAPPING).find(key => PROPERTY_MAPPING[key] === property.id),
        })),
        'id',
    );
    /**/

    return { resources: mappedEntities, properties, response: data.payload.annotations };
};

export const saveFeedback = async ({ request, response, serviceName }) =>
    submitPostRequest(
        `${nlpServiceUrl}feedback/`,
        { 'Content-Type': 'application/json' },
        { feedback: { request, response, service_name: serviceName } },
    );

export const semantifyBioassays = text =>
    submitPostRequest(`${nlpServiceUrl}clustering/bioassays/`, { 'Content-Type': 'application/json' }, { text });

export const extractTable = form =>
    fetch(`${nlpServiceUrl}tools/pdf/table/extract`, {
        method: 'POST',
        body: form,
    });

export const convertPdf = form =>
    fetch(`${nlpServiceUrl}tools/pdf/convert`, {
        method: 'POST',
        body: form,
    });

export const getRecommendedPredicates = async ({ title, abstract }) => {
    const { payload } = await submitPostRequest(
        `${nlpServiceUrl}clustering/predicates`,
        {
            'Content-Type': 'application/json',
        },
        {
            title,
            abstract,
        },
    );
    return payload;
};

export const getTemplateRecommendations = async ({ title, abstract, topN = 5 }) => {
    const { payload } = await submitPostRequest(
        `${nlpServiceUrl}nli/templates`,
        {
            'Content-Type': 'application/json',
        },
        {
            title,
            abstract,
            top_n: topN,
        },
    );
    return payload;
};

export const classifyPaper = async ({ smartSuggestionInputText, topN = 5 }) => {
    const { payload } = await submitPostRequest(
        `${nlpServiceUrl}annotation/rfclf`,
        {
            'Content-Type': 'application/json',
        },
        {
            raw_input: smartSuggestionInputText,
            top_n: topN,
        },
    );
    return payload;
};
