/**
 * Services file for the NLP service
 * https://gitlab.com/TIBHannover/orkg/nlp/orkg-nlp-api
 */

import { PREDICATES } from 'constants/graphSettings';
import { AGRICULTURE_FIELDS_LIST, COMPUTER_SCIENCE_FIELDS_LIST } from 'constants/nlpFieldLists';
import ky from 'ky';
import { keyBy, mapValues, uniq } from 'lodash';
import { env } from 'next-runtime-env';
import { getPredicate } from 'services/backend/predicates';
import { getResources } from 'services/backend/resources';
import { getParentResearchFields } from 'services/backend/statements';
import { Resource } from 'services/backend/types';

type NlpResponse<T> = {
    timestamp: string;
    uuid: string;
    payload: T;
};

export const nlpServiceUrl = env('NEXT_PUBLIC_NLP_SERVICE_URL');
const nlpServiceApi = ky.create({
    timeout: 1000 * 60 * 10, // 10 minutes
    prefixUrl: nlpServiceUrl,
});

// https://gitlab.com/TIBHannover/orkg/nlp/orkg-nlp-api/-/blob/main/app/__init__.py#L13
export const SERVICE_MAPPING: {
    [key: string]: string;
} = {
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

export const determineActiveNERService = async (field: string): Promise<string | null> => {
    if (!field) return null;
    let result = Object.keys(FIELDS_SERVICES_MAPPING).map((key) => FIELDS_SERVICES_MAPPING[key].includes(field));
    if (result.indexOf(true) === -1) {
        const parentFields = await getParentResearchFields(field);
        result = Object.keys(FIELDS_SERVICES_MAPPING).map(
            (key) => parentFields.some((_field: { id: string }) => FIELDS_SERVICES_MAPPING[key].includes(_field.id)), // type of field should come from the function itself, so ': { id: string }' can be removed in the future
        );
    }
    let activeNerService = null;
    try {
        activeNerService = Object.keys(FIELDS_SERVICES_MAPPING)[result.indexOf(true)];
    } catch {
        activeNerService = null;
    }
    return activeNerService;
};

type Classify = {
    labels: string[];
    scores: number[];
    sequence: string;
};

export const classifySentence = async ({ sentence, labels }: { sentence: string; labels: string[] }) => {
    const { payload } = await nlpServiceApi
        .post<NlpResponse<Classify>>('tools/text/classify', {
            json: {
                sentence,
                labels,
            },
        })
        .json();
    return payload;
};

type Summarize = {
    summary: string;
};

export const summarizeText = async ({ text, ratio }: { text: string; ratio: number }) => {
    const { payload } = await nlpServiceApi.post<NlpResponse<Summarize>>('tools/text/summarize', { json: { text, ratio } }).json();
    return payload;
};

export const PROPERTY_MAPPING: {
    [key: string]: string;
} = {
    RESEARCH_PROBLEM: PREDICATES.HAS_RESEARCH_PROBLEM,
    METHOD: PREDICATES.METHOD,
    LANGUAGE: PREDICATES.LANGUAGE,
    RESOURCE: PREDICATES.RESOURCE,
    TOOL: PREDICATES.TOOL,
    SOLUTION: PREDICATES.SOLUTION,
    DATASET: PREDICATES.HAS_DATASET,
};

type CsNerResponse = {
    annotations: {
        title: {
            concept: string;
            entities: string[];
        }[];
        abstract: {
            concept: string;
            entities: string[];
        }[];
    };
};

type AgriNerResponse = {
    annotations: {
        concept: string;
        entities: string[];
    }[];
};
export const getNerResults = async ({
    title = '',
    abstract = '',
    service = SERVICE_MAPPING.CS_NER,
}: {
    title: string;
    abstract: string;
    service: string;
}) => {
    let data: NlpResponse<CsNerResponse | AgriNerResponse> | null = null;
    let titleConcepts = null;
    let abstractConcepts = null;
    if (service === SERVICE_MAPPING.CS_NER) {
        data = await nlpServiceApi.post<NlpResponse<CsNerResponse>>('annotation/csner', { json: { title, abstract } }).json();
        titleConcepts = mapValues(keyBy((data!.payload as CsNerResponse).annotations.title, 'concept'), 'entities');
        abstractConcepts = mapValues(keyBy((data!.payload as CsNerResponse).annotations.abstract, 'concept'), 'entities');
    } else {
        data = await nlpServiceApi.post<NlpResponse<AgriNerResponse>>('annotation/agriner', { json: { title } }).json();
        titleConcepts = mapValues(keyBy(data!.payload.annotations, 'concept'), 'entities');
    }

    const mappedEntities: {
        [key: string]: {
            id?: string;
            label: string;
            isExistingValue?: boolean;
        }[];
    } = {};
    const mappedResourcePromises: {
        type: string;
        label: string;
        data: Promise<Resource[]>;
    }[] = [];

    for (const type of Object.keys(PROPERTY_MAPPING)) {
        const resources = uniq([...(titleConcepts?.[type] || []), ...(abstractConcepts?.[type] || [])]);
        mappedResourcePromises.push(
            ...resources.map((resource) => ({
                type,
                label: resource,
                data: getResources({ q: resource, exact: true, returnContent: true }) as Promise<Resource[]>,
            })),
        );
    }

    const resources = await Promise.all(mappedResourcePromises.map((promise) => promise.data));

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

    const propertyPromises = Object.keys(mappedEntities).map((propertyId) => getPredicate(propertyId));
    const properties = await Promise.all(propertyPromises);
    const propertiesByKey = keyBy(
        properties.map((property) => ({
            ...property,
            concept: Object.keys(PROPERTY_MAPPING).find((key) => PROPERTY_MAPPING[key] === property.id),
        })),
        'id',
    );
    /**/

    return { resources: mappedEntities, properties: propertiesByKey, response: data?.payload.annotations };
};

type FeedbackResponse = {
    id: string;
};
export const saveFeedback = async ({
    request,
    response,
    serviceName,
}: {
    request: object;
    response: object;
    serviceName: string;
}): Promise<NlpResponse<FeedbackResponse>> =>
    nlpServiceApi.post<NlpResponse<FeedbackResponse>>('feedback', { json: { feedback: { request, response, service_name: serviceName } } }).json();

type BioassayResponse = {
    labels: {
        property: {
            id: string;
            label: string;
        };
        resources: {
            id: string;
            label: string;
        }[];
    }[];
};
export const semantifyBioassays = (text: string) =>
    nlpServiceApi.post<NlpResponse<BioassayResponse>>('clustering/bioassays', { json: { text } }).json();

type extractTableResponse = {
    table: {
        [key: string]: string[];
    };
};

export const extractTable = (form: FormData): Promise<NlpResponse<extractTableResponse>> =>
    nlpServiceApi.post<NlpResponse<extractTableResponse>>('tools/pdf/table/extract', { body: form }).json();

export const convertPdf = (form: FormData): Promise<any> =>
    nlpServiceApi.post('tools/pdf/convert', {
        body: form,
    });

type extractSciKgTexResponse = {
    title: string;
    authors: {
        name: string;
    }[];
    research_fields: string[];
    contents: {
        contributions: {
            label: string;
            statements: {
                [key: string]: {
                    id: string;
                }[];
            };
        }[];
        literals: {
            [key: string]: {
                label: string;
            };
        };
    };
};
export const extractMetadataPdf = (form: FormData): Promise<NlpResponse<extractSciKgTexResponse>> =>
    nlpServiceApi.post<NlpResponse<extractSciKgTexResponse>>('tools/pdf/sci-kg-tex/extract', { body: form }).json();

type recommendedPredicatesResponse = {
    predicates: {
        id: string;
        label: string;
    }[];
};
export const getRecommendedPredicates = async ({ title, abstract }: { title?: string; abstract?: string }) => {
    const { payload } = await nlpServiceApi
        .post<NlpResponse<recommendedPredicatesResponse>>('clustering/predicates', {
            json: {
                title,
                abstract,
            },
        })
        .json();
    return payload;
};

type recommendedTemplatesResponse = {
    templates: {
        id: string;
        label: string;
    }[];
};

export const getTemplateRecommendations = async ({ title, abstract, topN = 5 }: { title: string; abstract: string; topN?: number }) => {
    const { payload } = await nlpServiceApi
        .post<NlpResponse<recommendedTemplatesResponse>>('nli/templates', {
            json: {
                title,
                abstract,
                top_n: topN,
            },
        })
        .json();
    return payload;
};

type ClassifyResponse = {
    annotations: {
        research_field: string;
        score: number;
    }[];
};

export const classifyPaper = async ({ smartSuggestionInputText, topN = 5 }: { smartSuggestionInputText: string; topN?: number }) =>
    nlpServiceApi
        .post<NlpResponse<ClassifyResponse>>('annotation/rfclf', {
            json: {
                raw_input: smartSuggestionInputText,
                top_n: topN,
            },
        })
        .json();

export const getLlmResponse = async ({
    taskName,
    placeholders,
}: {
    taskName: string;
    placeholders: {
        [key: string]: string;
    };
}): Promise<any> =>
    nlpServiceApi
        .post('tools/text/chatgpt', { json: { task_name: taskName, placeholders } })
        .json()
        /* @ts-expect-error API typing missing */
        .then((response) => response?.payload.arguments);
