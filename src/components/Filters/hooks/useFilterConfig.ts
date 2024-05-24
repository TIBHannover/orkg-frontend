import { mergeFilters } from 'components/Filters/helpers';
import useRouter from 'components/NextJsMigration/useRouter';
import useSearchParams from 'components/NextJsMigration/useSearchParams';
import useObservatoryFilters from 'components/Observatory/hooks/useObservatoryFilters';
import { FILTER_SOURCE } from 'constants/filters';
import { orderBy } from 'lodash';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { FilterConfig, FilterConfigValue } from 'services/backend/types';
import useLocalStorageFilters from 'components/Filters/hooks/useLocalStorageFilters';

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
    const searchParams = useSearchParams();
    const router = useRouter();
    // Get filters from the local storage
    const { localStorageFilters: storedFilters, refresh: refreshLocalStorageFilters } = useLocalStorageFilters();

    // Parse filters from sources
    let urlFilters = JSON.parse(searchParams.get('filter_config') || '[]') as FilterConfig[];
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
        const params = new URLSearchParams(searchParams.toString());
        params.set('filter_config', JSON.stringify(activeFilters));
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const resetFilters = () => {
        const params = new URLSearchParams(searchParams.toString());
        setFilters((prev) => prev.map((f) => ({ ...f, values: [] })));
        params.delete('filter_config');
        router.push(`?${params.toString()}`, { scroll: false });
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
