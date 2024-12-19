import { ExternalServiceResponse, Ontology, OptionType, OptionsSettings } from 'components/Autocomplete/types';
import { AUTOCOMPLETE_SOURCE } from 'constants/autocompleteSources';
import { CLASSES, ENTITIES, PREDICATES } from 'constants/graphSettings';
import REGEX from 'constants/regex';
import { uniqBy } from 'lodash';
import type { GroupBase, OptionsOrGroups } from 'react-select';
import { MultiValue } from 'react-select';
import { getClasses } from 'services/backend/classes';
import { importClassByURI, importPredicateByURI, importResourceByURI } from 'services/backend/import';
import { createLiteral } from 'services/backend/literals';
import { getEntities } from 'services/backend/misc';
import { createResource, getResources } from 'services/backend/resources';
import { createLiteralStatement, getStatements } from 'services/backend/statements';
import { getThing } from 'services/backend/things';
import { Class, EntityType, Predicate, Resource, Statement } from 'services/backend/types';
import getGeoNames from 'services/geoNames';
import { getOntologyTerms, selectTerms } from 'services/ols';
import { searchEntity } from 'services/wikidata';

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
} & OptionsSettings) => {
    const exact = !!(value.startsWith('"') && value.endsWith('"') && value.length > 2);
    const isURI = new RegExp(REGEX.URL).test(value.trim());
    let localValue = value;
    if (exact) {
        localValue = localValue.substring(1, localValue.length - 1).trim();
    }
    let responseJson;

    if (entityType === ENTITIES.RESOURCE) {
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
            responseJson = (await getClasses({
                page,
                size: pageSize,
                exact,
                uri: localValue.trim(),
            })) as Class;
        } catch (error) {
            // No matching class
            return { content: [], last: true, totalElements: 0 };
        }
        responseJson = responseJson ? { content: [responseJson], last: true, totalElements: 1 } : { content: [], last: true, totalElements: 0 };
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
export const IdMatch = async (value: string): Promise<(Resource | Predicate | Class)[]> => {
    if (value.startsWith('#')) {
        const valueWithoutHashtag = value.substring(1);
        if (valueWithoutHashtag.length > 0) {
            let responseJsonExact: Resource | Predicate | Class | undefined;
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
    if (additionalOptions && additionalOptions.length > 0 && page === 0) {
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
        const classes = {
            [ENTITIES.CLASS]: 'class',
            [ENTITIES.PREDICATE]: 'property',
            [ENTITIES.RESOURCE]: 'individual',
            default: 'individual',
        };
        if (value) {
            promises.push(
                selectTerms({
                    page,
                    pageSize,
                    type: classes[entityType] || classes.default,
                    q: encodeURIComponent(value.trim()),
                    ontology: selectedOlsOntologies.map((o) => o.id).join(','),
                }),
            );
        } else {
            for (const o of selectedOlsOntologies) {
                promises.push(
                    getOntologyTerms({
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

const findOrCreateResource = async (value: OptionType) => {
    let resource;
    resource = value.uri
        ? ((await getStatements({
              subjectLabel: value.label,
              objectLabel: value.uri,
              subjectClasses: [CLASSES.EXTERNAL],
              predicateId: PREDICATES.SAME_AS,
              size: 1,
              returnContent: true,
          })) as Statement[])
        : [];
    resource = resource.length > 0 ? resource[0].subject : null;
    if (!resource) {
        resource = await createResource(value.label, [CLASSES.EXTERNAL, ...(value.classes ?? [])]);
        if (value.uri) {
            createLiteralStatement(resource.id, PREDICATES.SAME_AS, (await createLiteral(value.uri, 'xsd:anyURI')).id);
        }
        if (value.description) {
            createLiteralStatement(resource.id, PREDICATES.DESCRIPTION, (await createLiteral(value.description)).id);
        }
    }
    return resource;
};

export const importStatements = async (id: string, value: OptionType) => {
    for (const s of value.statements ?? []) {
        createLiteralStatement(id, s.predicate, (await createLiteral(s.value.label)).id);
    }
};

export const importExternalSelectedOption = async (entityType: EntityType, value: OptionType) => {
    let importedValue: OptionType;
    if (!value.external) {
        return value;
    }
    // Import the option
    if (entityType === ENTITIES.RESOURCE && value.ontology && value.uri) {
        if (value.source !== AUTOCOMPLETE_SOURCE.OLS_API) {
            importedValue = await importResourceByURI({ ontology: value.ontology.toLowerCase(), uri: value.uri });
        } else {
            importedValue = (await findOrCreateResource(value)) as OptionType;
        }
    } else if (entityType === ENTITIES.PREDICATE && value.ontology && value.uri) {
        importedValue = await importPredicateByURI({ ontology: value.ontology.toLowerCase(), uri: value.uri });
    } else if (entityType === ENTITIES.CLASS && value.ontology && value.uri) {
        importedValue = await importClassByURI({ ontology: value.ontology.toLowerCase(), uri: value.uri });
    } else {
        throw new Error('No implemented yet.');
    }
    if (importedValue) {
        importStatements(importedValue.id, value);
    }

    return importedValue;
};
