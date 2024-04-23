import { FILTERS_LOCAL_STORAGE_NAME } from 'constants/filters';
import { isEqual } from 'lodash';
import { FilterConfig } from 'services/backend/types';
import { asyncLocalStorage } from 'utils';

export function areFiltersEqual(a: FilterConfig, b: FilterConfig): boolean {
    return a.range === b.range && isEqual(a.path, b.path) && isEqual(a.exact, b.exact);
}

export const mergeFilters = (initialFilters: FilterConfig[], newFilters: FilterConfig[]): FilterConfig[] => {
    if (!newFilters || newFilters.length === 0) {
        return initialFilters;
    }
    let _initialFilters = initialFilters;
    const mergedFilters = newFilters.map((newFilter) => {
        const existingFilter = _initialFilters.find((f) => areFiltersEqual(newFilter, f));
        if (existingFilter) {
            _initialFilters = _initialFilters.filter((f) => !areFiltersEqual(existingFilter, f));
            return { ...newFilter, persisted: existingFilter.persisted, values: existingFilter.values };
        }
        return { ...newFilter, values: [] };
    });
    return [...mergedFilters, ..._initialFilters];
};

export const loadFiltersFromLocalStorage = async () => {
    const data = await asyncLocalStorage.getItem(FILTERS_LOCAL_STORAGE_NAME);
    try {
        const parsedData = JSON.parse(data ?? '') as FilterConfig[];
        return parsedData && Array.isArray(parsedData) ? parsedData : [];
    } catch (e) {}
    return [];
};
