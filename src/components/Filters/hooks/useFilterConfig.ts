import { mergeFilters } from 'components/Filters/helpers';
import useLocalStorageFilters from 'components/Filters/hooks/useLocalStorageFilters';
import useObservatoryFilters from 'components/Observatory/hooks/useObservatoryFilters';
import { FILTER_SOURCE } from 'constants/filters';
import { orderBy } from 'lodash';
import { parseAsJson, useQueryState } from 'nuqs';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { FilterConfig, FilterConfigValue } from 'services/backend/types';
import { z } from 'zod';

export const schemaFilterConfig = z.array(
    z.object({
        id: z.string().optional(),
        observatory_id: z.string().optional(),
        label: z.string().optional(),
        path: z.array(z.string()),
        range: z.string(),
        exact: z.boolean(),
        created_at: z.string().optional(),
        created_by: z.string().optional(),
        featured: z.boolean().optional(),
        persisted: z.boolean().optional(),
        values: z.array(z.any()).optional(),
        source: z.string().optional(),
    }),
);

const useFilterConfig = ({
    oId,
}: {
    oId: string;
}): {
    filters?: FilterConfig[];
    isLoadingFilters: boolean;
    canReset: boolean;
    setFilters: Dispatch<SetStateAction<FilterConfig[]>>;
    showResult: () => void;
    resetFilters: () => void;
    refreshFilters: () => void;
    updateFilterValue: (_filter: FilterConfig, _value: FilterConfigValue[] | string) => void;
} => {
    // Load default filters
    const { isLoading: isLoadingFilters, filters: defaultFilters, refreshFilters: refreshObservatoryFilters } = useObservatoryFilters({ id: oId });

    const [filterConfig, setFilterConfig] = useQueryState<FilterConfig[]>(
        'filter_config',
        parseAsJson<FilterConfig[]>(schemaFilterConfig.parse).withDefault([]),
    );

    // Get filters from the local storage
    const { localStorageFilters: storedFilters, refresh: refreshLocalStorageFilters } = useLocalStorageFilters();

    // Parse filters from sources
    let urlFilters = filterConfig ?? [];
    urlFilters = urlFilters.map((f) => ({ ...f, source: FILTER_SOURCE.URL }));
    // Combine filters based on priority
    // Combine url filters with default filters
    let initial = mergeFilters(urlFilters, defaultFilters ?? []);
    // Combine initial filters with local storage filters
    initial = mergeFilters(initial, storedFilters);

    const [filters, setFilters] = useState<FilterConfig[]>(initial);

    // update the filters when url or the default filters gets updated
    const strInitial = JSON.stringify(initial);
    useEffect(() => {
        setFilters(JSON.parse(strInitial));
    }, [strInitial]);

    // Apply the filters
    const showResult = () => {
        const activeFilters = filters
            ?.filter((f) => f.values && f.values?.length > 0)
            .map((f) => ({
                label: f.label,
                path: f.path,
                range: f.range,
                values: f.values?.map(({ op, value }) => (typeof value === 'object' ? { op, value: value?.id } : { op, value })),
                exact: f.exact,
            }));
        setFilterConfig(activeFilters, { scroll: false, history: 'push' });
    };

    const resetFilters = () => {
        setFilters((prev) => prev.map((f) => ({ ...f, values: [] })));
        setFilterConfig(null, { scroll: false, history: 'push' });
    };

    const updateFilterValue = (filter: FilterConfig, value: FilterConfigValue[] | string) => {
        const _newValues = filters.map((f: FilterConfig, index: number) => {
            if ((filter.id && f.id === filter.id) || filter.id === index.toString()) {
                return {
                    ...f,
                    values: value,
                } as FilterConfig;
            }
            return f;
        });
        setFilters(_newValues);
    };

    const canReset = urlFilters.length > 0 || urlFilters.length !== filters?.filter((f) => f.values && f.values?.length > 0).length;

    const refreshFilters = () => {
        refreshLocalStorageFilters();
        refreshObservatoryFilters();
    };

    return {
        filters: orderBy(filters, ['featured', 'persisted'], ['desc', 'desc']),
        isLoadingFilters,
        canReset,
        setFilters,
        showResult,
        resetFilters,
        refreshFilters,
        updateFilterValue,
    };
};

export default useFilterConfig;
