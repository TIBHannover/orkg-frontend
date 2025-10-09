import { maxBy } from 'lodash';

import { OptionType } from '@/components/Autocomplete/types';
import DATA_TYPES, { DataType, getConfigByClassId, getSuggestionByValue } from '@/constants/DataTypes';
import { CLASSES, ENTITIES, MISC, PREDICATES } from '@/constants/graphSettings';

export type MappedColumn = { predicate: OptionType | null; inputValue: string; type: DataType };

export const DEFAULT_HEADERS = [
    { id: 'title', label: 'title', _class: ENTITIES.PREDICATE, hideLink: true },
    { id: PREDICATES.HAS_DOI, label: 'doi', _class: ENTITIES.PREDICATE },
    { id: PREDICATES.URL, label: ' url', _class: ENTITIES.PREDICATE },
    { id: PREDICATES.HAS_AUTHORS, label: 'authors', _class: ENTITIES.PREDICATE },
    { id: PREDICATES.HAS_PUBLICATION_MONTH, label: 'publication month', alternativeLabels: ['publication_month'], _class: ENTITIES.PREDICATE },
    { id: PREDICATES.HAS_PUBLICATION_YEAR, label: 'publication year', alternativeLabels: ['publication_year'], _class: ENTITIES.PREDICATE },
    {
        id: PREDICATES.HAS_VENUE,
        label: 'published in',
        alternativeLabels: ['published_in', 'venue', 'journal', 'conference'],
        _class: ENTITIES.PREDICATE,
    },
    { id: PREDICATES.HAS_RESEARCH_FIELD, label: 'research field', alternativeLabels: ['research_field'], _class: ENTITIES.PREDICATE },
    { id: PREDICATES.HAS_RESEARCH_PROBLEM, label: 'research problem', alternativeLabels: ['research_problem'], _class: ENTITIES.PREDICATE },
    { id: 'extraction_method', label: 'extraction method', _class: ENTITIES.PREDICATE, hideLink: true },
];

export const matchHeaderByLabel = (header: string) => {
    const defaultHeader = DEFAULT_HEADERS.find(
        (h) =>
            header.toLowerCase().includes(h.label.toLowerCase()) ||
            header.toLowerCase() === h.id.toLowerCase() ||
            h.alternativeLabels?.some((alt) => header.toLowerCase().includes(alt.toLowerCase())),
    );
    if (defaultHeader) return defaultHeader;
    return null;
};

export const determineColumnType = (columnData: string[], allTypes: DataType[]) => {
    const typeCount: Record<string, { count: number; classId: string; name: string }> = {};
    for (const value of columnData) {
        if (value && value.trim() !== '') {
            const typeSuggestion = getSuggestionByValue(value)[0];
            if (!typeCount[typeSuggestion.type]) {
                typeCount[typeSuggestion.type] = {
                    count: 0,
                    classId: typeSuggestion.classId,
                    name: typeSuggestion.name,
                };
            }
            typeCount[typeSuggestion.type].count += 1;
        }
    }
    // Determine the type with the highest count
    const maxCountType = maxBy(Object.values(typeCount), 'count');
    return allTypes.find((dt) => dt.classId === maxCountType?.classId) ?? getConfigByClassId(CLASSES.STRING);
};

export const isDefaultHeader = (headerId: string) => {
    return !!DEFAULT_HEADERS.find((h) => h.id === headerId);
};

/**
 * Parses a cell string to extract the label, type information, and resource indicators.
 * Cells can be in the following formats:
 * - "label<type>" - Regular cell with type information
 * - "resource:label" - New resource indicator
 * - "orkg:id" - Existing ORKG resource
 * - "orkg:id<type>" - ORKG predicate with type specification
 * - "label" - Plain text
 *
 * @param cell - The cell string to parse
 * @returns An object containing the parsed information
 */
export const parseCellString = (cell: string) => {
    // Check for resource prefix
    if (cell.startsWith('resource:')) {
        const label = cell.replace(/^resource:/, '');
        return {
            label,
            typeStr: null,
            hasTypeInfo: false,
            isNewResource: true,
            isExistingResource: false,
            entityId: null,
        };
    }

    // Check for ORKG ID prefix
    if (cell.startsWith('orkg:')) {
        // Check if it has type information
        const matchType = cell.match(/^orkg:(.*?)<(.*?)>$/);
        if (matchType) {
            return {
                label: matchType[1],
                typeStr: matchType[2],
                hasTypeInfo: true,
                isNewResource: false,
                isExistingResource: true,
                entityId: matchType[1],
            };
        }

        // No type information, just ORKG ID
        const entityId = cell.replace(/^orkg:/, '');
        return {
            label: entityId,
            typeStr: null,
            hasTypeInfo: false,
            isNewResource: false,
            isExistingResource: true,
            entityId,
        };
    }

    // Check for type information in angle brackets (non-ORKG case)
    const matchType = cell.match(/^(.*?)<(.*?)>$/);
    if (matchType) {
        return {
            label: matchType[1].trim(),
            typeStr: matchType[2],
            hasTypeInfo: true,
            isNewResource: false,
            isExistingResource: false,
            entityId: null,
        };
    }

    // Plain text case
    return {
        label: cell,
        typeStr: null,
        hasTypeInfo: false,
        isNewResource: false,
        isExistingResource: false,
        entityId: null,
    };
};

/**
 * Finds a DataType object by its ID or name
 * @param typeIdentifier - The ID or name of the type to find
 * @param dataTypes - Array of available data types
 * @returns The matching DataType object or null if not found
 */
export const findTypeByIdOrName = (typeIdentifier: string) => {
    return (
        DATA_TYPES.find(
            (option) => option.classId.toLowerCase() === typeIdentifier.toLowerCase() || option.name.toLowerCase() === typeIdentifier.toLowerCase(),
        ) || (DATA_TYPES.find((dt) => dt.type === MISC.DEFAULT_LITERAL_DATATYPE) as DataType)
    );
};
