import { submitGetRequest } from 'network';
import qs from 'qs';
import env from '@beam-australia/react-env';

export const olsBaseUrl = env('OLS_BASE_URL');

export const selectTerms = ({ page = 0, pageSize = 10, type = 'ontology', q = null, ontology = null }) => {
    const params = qs.stringify(
        {
            rows: pageSize,
            start: page * pageSize,
            type,
            ...(q ? { q } : {}),
            ontology,
            fieldList: 'label,ontology_prefix,id,iri,description,short_form',
        },
        {
            skipNulls: true,
        },
    );
    const options = [];
    return submitGetRequest(`${olsBaseUrl}select?${params}`).then(res => {
        if (res.response.numFound > 0) {
            for (const item of res.response.docs) {
                options.push({
                    label: item.label,
                    id: item.short_form,
                    ontologyId: item.id,
                    ...(item.iri ? { uri: item.iri } : {}),
                    ...(item.description && item.description.length > 0 ? { description: item.description[0] } : {}),
                    external: true,
                    source: 'ols-api',
                    ontology: item.ontology_prefix,
                    shortForm: item.short_form,
                    tooltipData: [],
                });
            }
        }
        return {
            content: options,
            last: Math.ceil(res.response.numFound / pageSize) <= page,
            totalElements: res.response.numFound,
        };
    });
};

export const getAllOntologies = ({ page = 0, pageSize = 10 }) => {
    const params = qs.stringify(
        { page, size: pageSize },
        {
            skipNulls: true,
        },
    );
    const options = [];

    return submitGetRequest(`${olsBaseUrl}ontologies?${params}`).then(res => {
        if (res._embedded.ontologies.length > 0) {
            for (const item of res._embedded.ontologies) {
                options.push({
                    label: item.config.title,
                    id: item.config.preferredPrefix,
                    ontologyId: item.ontologyId,
                    ...(item.config.fileLocation ? { uri: item.config.fileLocation } : {}),
                    external: true,
                    ontology: item.ontologyId,
                    ...(item.config.homepage ? { uri: item.config.homepage } : { uri: item.config.id }),
                });
            }
        }
        return { content: options, last: res.page.totalPages <= res.page.number, totalElements: res.page.totalElements };
    });
};

export const getOntologyTerms = ({ ontology_id, page = 0, pageSize = 10 }) => {
    const params = qs.stringify(
        { page, size: pageSize },
        {
            skipNulls: true,
        },
    );
    const options = [];

    return submitGetRequest(`${olsBaseUrl}ontologies/${ontology_id}/terms?${params}`).then(res => {
        if (res._embedded.terms.length > 0) {
            for (const item of res._embedded.terms) {
                options.push({
                    label: item.label,
                    id: item.short_form,
                    ontologyId: item.id,
                    ...(item.iri ? { uri: item.iri } : {}),
                    ...(item.description && item.description.length > 0 ? { description: item.description[0] } : {}),
                    external: true,
                    source: 'ols-api',
                    ontology: item.ontology_prefix,
                    shortForm: item.short_form,
                    tooltipData: [],
                });
            }
        }
        return { content: options, last: res.page.totalPages <= res.page.number, totalElements: res.page.totalElements };
    });
};

export const getTermMatchingAcrossOntologies = ({ page = 0, pageSize = 10 }) => {
    const params = qs.stringify(
        { page, size: pageSize },
        {
            skipNulls: true,
        },
    );
    const options = [];

    return submitGetRequest(`${olsBaseUrl}terms/?${params}`).then(res => {
        if (res._embedded.terms.length > 0) {
            for (const item of res._embedded.terms) {
                options.push({
                    label: item.label,
                    id: item.short_form,
                    ontologyId: item.id,
                    ...(item.iri ? { uri: item.iri } : {}),
                    ...(item.description && item.description.length > 0 ? { description: item.description[0] } : {}),
                    external: true,
                    source: 'ols-api',
                    ontology: item.ontology_prefix,
                    shortForm: item.short_form,
                    tooltipData: [],
                });
            }
        }
        return { content: options, last: res.page.totalPages <= res.page.number, totalElements: res.page.totalElements };
    });
};
