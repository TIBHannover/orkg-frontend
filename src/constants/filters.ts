import { FilterConfigOperator } from '@/services/backend/types';

export const FILTER_SOURCE = {
    URL: 'URL',
    DATABASE: 'DATABASE',
    LOCAL_STORAGE: 'LocalStorage',
};

export const FILTERS_LOCAL_STORAGE_NAME = 'filters';

// Define a map of operators and their corresponding codes
export const OPERATORS_MAP: { [_key in string]: FilterConfigOperator } = {
    '<=': 'LE',
    '>=': 'GE',
    '!=': 'NE',
    '>': 'GT',
    '<': 'LT',
    '=': 'EQ',
};
