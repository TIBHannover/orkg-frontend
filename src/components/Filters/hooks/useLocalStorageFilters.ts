import { useEffect, useState } from 'react';

import { loadFiltersFromLocalStorage } from '@/components/Filters/helpers';
import { FilterConfig } from '@/services/backend/types';

const useLocalStorageFilters = (): {
    localStorageFilters: FilterConfig[];
    refresh: () => void;
} => {
    const [localStorageFilters, setLocalStorageFilters] = useState<FilterConfig[]>([]);

    const refresh = async () => {
        const _localStorage = await loadFiltersFromLocalStorage();
        setLocalStorageFilters(_localStorage);
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        refresh();
    }, []);

    return {
        refresh,
        localStorageFilters,
    };
};

export default useLocalStorageFilters;
