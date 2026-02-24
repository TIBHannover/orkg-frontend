export type FilterType = 'category' | 'number' | 'date' | 'text';

export type FilterValues = {
    minValue?: number;
    maxValue?: number;
    startDate?: string;
    endDate?: string;
    values?: string[];
};

export type Filter = {
    id: string;
    path: string[];
    type: FilterType;
    filterValues: FilterValues;
};

export type ComparisonFilter = {
    [comparisonId: string]: Filter[];
};
