import { isString } from 'lodash';

import { findTypeByIdOrName, parseCellString } from '@/app/csv-import/steps/helpers';
import DATA_TYPES, { DataType, getSuggestionByValue } from '@/constants/DataTypes';
import { MISC } from '@/constants/graphSettings';
import { getPaperByDoi, getPaperByTitle } from '@/services/backend/papers';
import { Paper } from '@/services/backend/types';

export const getFirstValue = (object: Record<string, string[]>, key: string, defaultValue: string = ''): string =>
    key in object && object[key].length && object[key][0] ? object[key][0] : defaultValue;

export const cleanLabel = (label: string) => label.replace(/^(orkg:)/, '');

export const propertyHasMapping = (value: string) =>
    isString(value) && (value.startsWith('orkg:') || value.replace(/^(resource:)/, '').startsWith('orkg:'));

export const findDataType = (literal: string) => DATA_TYPES.find((type) => literal.toLowerCase().endsWith(`<${type.classId.toLowerCase()}>`));

export const removeDataTypeLiteral = ({ literal, datatype }: { literal: string; datatype: DataType }) =>
    literal.replace(new RegExp(`<${datatype.classId}>$`), '');

export const removeDataTypeHeader = (label: string) => {
    const datatype = findDataType(label);
    return datatype ? removeDataTypeLiteral({ literal: label, datatype }) : label;
};

export const cleanLabelProperty = (label: string) =>
    removeDataTypeHeader(label)
        .replace(/^(resource:)/, '')
        .replace(/^(orkg:)/, '');

export const hasMapping = (value: string) => isString(value) && value.startsWith('orkg:');

export const isNewResource = (value: string) => isString(value) && value.startsWith('resource:');

export const cleanNewResource = (label: string) => label.replace(/^(resource:)/, '');

export const parseDataTypes = ({ value: literal, property }: { value: string; property: string }) => {
    // the type given on the cell has priority over the type given on the property
    const { label, typeStr, hasTypeInfo } = parseCellString(literal);
    if (hasTypeInfo && typeStr) {
        const typeObj = findTypeByIdOrName(typeStr);
        return {
            text: typeObj ? label : literal,
            datatype: typeObj ? typeObj.type : MISC.DEFAULT_LITERAL_DATATYPE,
        };
    }
    const datatype = findDataType(property) || getSuggestionByValue(literal)?.[0];
    return {
        text: datatype ? label : literal,
        datatype: datatype ? datatype.type : MISC.DEFAULT_LITERAL_DATATYPE,
    };
};

export const getExistingPaperId = async (title: string, doi: string) => {
    let paper: Paper | null = null;
    // first check if there is a paper with this DOI
    if (doi) {
        paper = await getPaperByDoi(doi);
    }
    // if no paper is found, check if there is a paper with this title
    if (!paper && title) {
        paper = await getPaperByTitle(title);
    }

    return paper ? paper.id : null;
};
