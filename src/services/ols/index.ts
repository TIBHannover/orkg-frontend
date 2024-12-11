import { Ontology, OntologyTerm, OptionType } from 'components/Autocomplete/types';
import { AUTOCOMPLETE_SOURCE } from 'constants/autocompleteSources';
import ky from 'ky';
import { env } from 'next-runtime-env';
import qs from 'qs';
import type { GroupBase, OptionsOrGroups } from 'react-select';

/**
 * OLS API is 0 indexed pages
 */

export const olsBaseUrl = env('NEXT_PUBLIC_OLS_BASE_URL');
const olsApi = ky.create({ prefixUrl: olsBaseUrl });

export type AdditionalType = {
    page: number;
};

const PAGE_SIZE = 12;

export const selectTerms = ({ page = 0, pageSize = 10, type = 'ontology', q = '', ontology = '' }) => {
    const params = qs.stringify(
        {
            rows: pageSize,
            start: page * pageSize,
            type,
            ...(q ? { q } : {}),
            ontology,
            fieldList: 'label,ontology_name,id,iri,description,short_form,ontology_prefix',
        },
        {
            skipNulls: true,
        },
    );
    const options: (Ontology | OptionType)[] = [];
    return olsApi
        .get('select', {
            searchParams: params,
        })
        .json()
        .then((res) => {
            /* @ts-ignore-error API typing missing */
            if (res.response.numFound > 0) {
                /* @ts-ignore-error API typing missing */
                for (const item of res.response.docs) {
                    options.push({
                        id: type === 'ontology' ? item.ontology_name : item.short_form,
                        label: item.label,
                        ...(item.iri ? { uri: item.iri } : {}),
                        ...(item.description && item.description.length > 0 ? { description: item.description[0] } : {}),
                        ...(type === 'ontology'
                            ? { shortLabel: item.ontology_name }
                            : { ontology: item.ontology_prefix, statements: [], tooltipData: [] }),
                        external: true,
                        source: AUTOCOMPLETE_SOURCE.OLS_API,
                    });
                }
            }
            return {
                options,
                /* @ts-ignore-error API typing missing */
                hasMore: !(Math.ceil(res.response.numFound / pageSize) <= page),
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

    const options: Ontology[] = [];

    return olsApi
        .get('ontologies', {
            searchParams: params,
        })
        .json()
        .then((res) => {
            /* @ts-ignore-error API typing missing */
            if (res._embedded.ontologies.length > 0) {
                /* @ts-ignore-error API typing missing */
                for (const item of res._embedded?.ontologies ?? []) {
                    options.push({
                        shortLabel: item.config.preferredPrefix,
                        id: item.ontologyId,
                        label: item.config.title,
                        ...(item.config.baseUris?.length > 0 ? { uri: item.config.baseUris[0] } : {}),
                        ...(item.config.description ? { description: item.config.description } : {}),
                        external: true,
                        source: AUTOCOMPLETE_SOURCE.OLS_API,
                    });
                }
            }
            /* @ts-ignore-error API typing missing */
            return { options, hasMore: !(res.page.totalPages <= res.page.number) };
        });
};

/**
 * Lookup for an ontology
 *
 * @param {String} _value Search input
 * @param {Array} page Page number
 * @return {Array} The list of ontologies
 */
const ontologySearch = async (_value: string, page: number) => {
    if (_value) {
        try {
            return await selectTerms({ page, pageSize: PAGE_SIZE, type: 'ontology', q: encodeURIComponent(_value.trim()) });
        } catch (error) {
            // No matching class
            return { options: [], hasMore: false };
        }
    } else {
        // List all ontologies
        try {
            return await getAllOntologies({ page, pageSize: PAGE_SIZE });
        } catch (error) {
            // No matching class
            return { options: [], hasMore: false };
        }
    }
};

export const loadOntologiesOptions = async (
    search: string,
    prevOptions: OptionsOrGroups<Ontology, GroupBase<Ontology>>,
    additional: AdditionalType | undefined,
) => {
    try {
        const result = await ontologySearch(search, additional?.page ?? 0);
        const { options, hasMore } = result;

        return {
            options: options as Ontology[],
            hasMore,
            additional: {
                page: (additional?.page ?? 0) + 1,
            },
        };
    } catch (err) {
        console.error(err);
        return {
            options: prevOptions,
            hasMore: false,
            additional: {
                page: 0,
            },
        };
    }
};

export const getOntologyTerms = ({ ontology_id = '', page = 0, pageSize = 10 }) => {
    const params = qs.stringify(
        { page, size: pageSize },
        {
            skipNulls: true,
        },
    );
    const options: OntologyTerm[] = [];

    return olsApi
        .get(`ontologies/${ontology_id}/terms`, {
            searchParams: params,
        })
        .json()
        .then((res) => {
            /* @ts-ignore-error API typing missing */
            if (res._embedded?.terms?.length > 0) {
                /* @ts-ignore-error API typing missing */
                for (const item of res._embedded.terms) {
                    options.push({
                        label: item.label,
                        id: item.short_form,
                        ...(item.iri ? { uri: item.iri } : {}),
                        ...(item.description && item.description.length > 0 ? { description: item.description[0] } : {}),
                        external: true,
                        source: 'ols-api',
                        ontology: item.ontology_prefix,
                        shortLabel: item.short_form,
                        tooltipData: [],
                    });
                }
            }
            return {
                options,
                /* @ts-ignore-error API typing missing */
                hasMore: !(res.page.totalPages <= res.page.number),
            };
        });
};

export const getTermMatchingAcrossOntologies = ({ page = 0, pageSize = 10 }) => {
    const params = qs.stringify(
        { page, size: pageSize },
        {
            skipNulls: true,
        },
    );
    const options: OntologyTerm[] = [];

    return olsApi
        .get('terms', {
            searchParams: params,
        })
        .json()
        .then((res) => {
            /* @ts-ignore-error API typing missing */
            if (res._embedded?.terms?.length > 0) {
                /* @ts-ignore-error API typing missing */
                for (const item of res._embedded.terms) {
                    options.push({
                        label: item.label,
                        id: item.id,
                        ...(item.iri ? { uri: item.iri } : {}),
                        ...(item.description && item.description.length > 0 ? { description: item.description[0] } : {}),
                        external: true,
                        source: 'ols-api',
                        ontology: item.ontology_prefix,
                        shortLabel: item.short_form,
                        tooltipData: [],
                    });
                }
            }
            /* @ts-ignore-error API typing missing */
            return { content: options, last: res.page.totalPages <= res.page.number, totalElements: res.page.totalElements };
        });
};
