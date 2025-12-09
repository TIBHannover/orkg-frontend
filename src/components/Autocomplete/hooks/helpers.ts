import { uniqBy } from 'lodash';
import type { GroupBase, OptionsOrGroups } from 'react-select';
import { MultiValue } from 'react-select';

import { ExternalServiceResponse, Ontology, OptionsSettings, OptionType } from '@/components/Autocomplete/types';
import { AUTOCOMPLETE_SOURCE } from '@/constants/autocompleteSources';
import { CLASSES, ENTITIES } from '@/constants/graphSettings';
import REGEX from '@/constants/regex';
import { getClasses } from '@/services/backend/classes';
import { importClassByURI, importPredicateByURI, importResourceByURI } from '@/services/backend/import';
import { createLiteral } from '@/services/backend/literals';
import { getEntities } from '@/services/backend/misc';
import { getResources } from '@/services/backend/resources';
import { createLiteralStatement } from '@/services/backend/statements';
import { getThing, Thing } from '@/services/backend/things';
import { Class, EntityType, PaginatedResponse, Predicate, Resource } from '@/services/backend/types';
import getGeoNames from '@/services/geoNames';
import { EntityPath, getOntologyEntities, selectEntities } from '@/services/ols';
import { searchEntity } from '@/services/wikidata';

/**
 * Lookup in ORKG backend
 */
export const orkgLookup = async ({
    value,
    page,
    entityType,
    baseClass,
    includeClasses,
    excludeClasses,
    pageSize,
}: {
    value: string;
    page: number;
    pageSize: number;
} & OptionsSettings): Promise<PaginatedResponse<Resource | Predicate | Class>> => {
    const exact = !!(value.startsWith('"') && value.endsWith('"') && value.length > 2);
    const isURI = new RegExp(REGEX.URL).test(value.trim());
    let localValue = value;
    if (exact) {
        localValue = localValue.substring(1, localValue.length - 1).trim();
    }
    let responseJson;
    if (entityType === ENTITIES.RESOURCE || includeClasses?.includes(CLASSES.CSVW_TABLE) || includeClasses?.includes(CLASSES.LIST)) {
        responseJson = await getResources({
            baseClass,
            include: includeClasses,
            exclude: excludeClasses,
            q: localValue?.trim() || '',
            page,
            size: pageSize,
            exact,
        });
    } else if (entityType === ENTITIES.CLASS && isURI) {
        // Lookup a class by uri
        try {
            const r = await getClasses({
                page,
                size: pageSize,
                exact,
                uri: localValue.trim(),
            });
            if (r && !('page' in r) && !('content' in r)) {
                responseJson = { content: [r], page: { total_elements: 1, total_pages: 1, size: 0, number: 0 } };
            } else if (!('page' in r) && !('content' in r)) {
                responseJson = { content: [], page: { total_elements: 0, total_pages: 0, size: 0, number: 0 } };
            } else {
                responseJson = r as unknown as PaginatedResponse<Class>;
            }
        } catch (error) {
            // No matching class
            return { content: [], page: { total_elements: 0, total_pages: 0, size: 0, number: 0 } };
        }
    } else {
        // Predicate or Class
        responseJson = await getEntities(entityType, {
            page,
            size: pageSize,
            q: localValue?.trim(),
            exact,
        });
    }

    return responseJson;
};

/**
 * Get Node by ID if the value starts with '#'
 */
export const IdMatch = async (value: string): Promise<Thing[]> => {
    if (value.startsWith('#')) {
        const valueWithoutHashtag = value.substring(1);
        if (valueWithoutHashtag.length > 0) {
            let responseJsonExact: Thing | undefined;
            try {
                responseJsonExact = await getThing(valueWithoutHashtag);
            } catch (err) {
                responseJsonExact = undefined;
            }
            if (responseJsonExact) {
                return [responseJsonExact];
            }
        }
    }
    return [];
};

/**
 * Filter by search the additional data and add it to the list of options
 */
export const addAdditionalData = (
    additionalOptions: OptionType[],
    value: string,
    prevOptions: OptionsOrGroups<OptionType, GroupBase<OptionType>>,
    page: number,
) => {
    if (additionalOptions && additionalOptions.filter((o) => o.label).length > 0 && page === 0) {
        let defaultOptions = additionalOptions;
        defaultOptions = defaultOptions.filter((option) => option.label.toLowerCase().includes(value.trim().toLowerCase()));
        (prevOptions as OptionType[]).unshift(...(defaultOptions as OptionType[]));
    }
    return uniqBy(prevOptions as OptionType[], 'id') as OptionType[];
};

/**
 *  Fetch autocomplete options from external APIs
 */
export const getExternalData = ({
    value,
    page,
    pageSize,
    includeClasses,
    entityType,
    selectedOntologies,
}: {
    value: string;
    page: number;
    pageSize: number;
    entityType: EntityType;
    includeClasses: string[];
    selectedOntologies: MultiValue<Ontology>;
}): Promise<ExternalServiceResponse>[] => {
    const promises = [];
    const ontologyIds = selectedOntologies.map((ontology) => ontology.id);

    // GeoNames
    if (includeClasses.includes(CLASSES.LOCATION) && !ontologyIds.includes('geonames')) {
        ontologyIds.push('geonames');
    }
    if (ontologyIds.includes('geonames') && entityType === ENTITIES.RESOURCE) {
        promises.push(getGeoNames({ value, pageSize, page }));
    }
    // Wikidata
    if (includeClasses.length === 0 && ontologyIds.includes('wikidata')) {
        const classes: { [key: string]: string } = {
            [ENTITIES.PREDICATE]: 'property',
            [ENTITIES.RESOURCE]: 'item',
        };
        promises.push(searchEntity({ value, page, pageSize, type: classes[entityType] || undefined }));
    }
    // OLS
    const selectedOlsOntologies = selectedOntologies.filter((ontology) => ontology.source === AUTOCOMPLETE_SOURCE.OLS_API);
    if (includeClasses.length === 0 && selectedOlsOntologies.length > 0) {
        if (value) {
            const types = {
                [ENTITIES.CLASS]: 'class',
                [ENTITIES.PREDICATE]: 'property',
                [ENTITIES.RESOURCE]: 'individual',
                default: 'entity',
            };
            promises.push(
                selectEntities({
                    page,
                    pageSize,
                    type: types[entityType] || types.default,
                    q: encodeURIComponent(value.trim()),
                    ontologies: selectedOlsOntologies.map((o) => o.id) as string[],
                }),
            );
        } else {
            for (const o of selectedOlsOntologies) {
                const urlPath: { [key: string]: EntityPath } = {
                    [ENTITIES.CLASS]: 'classes',
                    [ENTITIES.PREDICATE]: 'properties',
                    [ENTITIES.RESOURCE]: 'individuals',
                    default: 'entities',
                };
                promises.push(
                    getOntologyEntities({
                        type: urlPath[entityType] || urlPath.default,
                        ontology_id: o.id,
                        page,
                        pageSize,
                    }),
                );
            }
        }
    }
    return promises;
};

export const importStatements = async (id: string, value: OptionType) => {
    for (const s of value.statements ?? []) {
        createLiteralStatement(id, s.predicate, await createLiteral(s.value.label));
    }
};

export const importExternalSelectedOption = async (entityType: EntityType, value: OptionType) => {
    let importedValue: OptionType;
    if (!value.external) {
        return value;
    }
    try {
        // Import the option
        if (entityType === ENTITIES.RESOURCE && value.ontology && value.uri && value._class !== ENTITIES.CLASS) {
            importedValue = await importResourceByURI({ ontology: value.ontology.toLowerCase(), uri: value.uri });
        } else if (entityType === ENTITIES.PREDICATE && value.ontology && value.uri) {
            importedValue = await importPredicateByURI({ ontology: value.ontology.toLowerCase(), uri: value.uri });
            // If the option is a class, we need to import it as a class
        } else if ((entityType === ENTITIES.CLASS || value._class === ENTITIES.CLASS) && value.ontology && value.uri) {
            importedValue = await importClassByURI({ ontology: value.ontology.toLowerCase(), uri: value.uri });
        } else {
            throw new Error('No implemented yet.');
        }
        if (importedValue) {
            importStatements(importedValue.id, value);
        }
    } catch (e) {
        console.error(e);
        throw e;
    }
    return importedValue;
};
