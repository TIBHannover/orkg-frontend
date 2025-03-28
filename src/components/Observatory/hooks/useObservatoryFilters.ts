import useSWR from 'swr';

import { FILTER_SOURCE } from '@/constants/filters';
import { getFiltersByObservatoryId, observatoriesUrl } from '@/services/backend/observatories';
import { FilterConfig } from '@/services/backend/types';

const useObservatoryFilters = ({
    id,
}: {
    id: string;
}): {
    isLoading: boolean;
    filters: FilterConfig[] | undefined;
    refreshFilters: () => void;
} => {
    const {
        data: filters,
        isLoading,
        mutate,
    } = useSWR([{ id }, observatoriesUrl, 'getFiltersByObservatoryId'], ([params]) => getFiltersByObservatoryId(params));

    const refreshFilters = () => {
        mutate();
    };

    return { isLoading, filters: filters?.map((f) => ({ ...f, persisted: true, source: FILTER_SOURCE.DATABASE })), refreshFilters };
};

export default useObservatoryFilters;
