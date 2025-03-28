import { Dispatch, SetStateAction, useState } from 'react';
import { toast } from 'react-toastify';

import Confirm from '@/components/Confirmation/Confirmation';
import { areFiltersEqual, loadFiltersFromLocalStorage } from '@/components/Filters/helpers';
import useAuthentication from '@/components/hooks/useAuthentication';
import { FILTER_SOURCE, FILTERS_LOCAL_STORAGE_NAME } from '@/constants/filters';
import { createFiltersInObservatory, deleteFilterOfObservatory, updateFiltersOfObservatory } from '@/services/backend/observatories';
import { FilterConfig } from '@/services/backend/types';
import { asyncLocalStorage, getErrorMessage, guid } from '@/utils';

const useCurateFilters = ({
    oId,
    filters,
    setFilters,
    refreshFilters,
}: {
    oId: string;
    filters: FilterConfig[];
    setFilters: Dispatch<SetStateAction<FilterConfig[]>>;
    refreshFilters: () => void;
}): {
    isSaving: boolean;
    currentFilter: FilterConfig | null;
    handleSaveFilter: (_filterId: string | null, _filter: FilterConfig) => Promise<void>;
    deleteFilter: (_filter: FilterConfig) => void;
    setCurrentFilter: Dispatch<SetStateAction<FilterConfig | null>>;
} => {
    const { isCurationAllowed } = useAuthentication();
    const [isSaving, setIsSaving] = useState(false);
    const [currentFilter, setCurrentFilter] = useState<FilterConfig | null>(null);

    const handleSaveFilter = async (filterId: string | null, filter: FilterConfig) => {
        setIsSaving(true);
        if (isCurationAllowed && filter.persisted) {
            if (filterId) {
                await updateFiltersOfObservatory(oId, filterId, filter).catch((e) => {
                    toast.error(`Something went wrong while saving the filter! ${getErrorMessage(e) ?? e?.message}`);
                    setIsSaving(false);
                });
            } else {
                await createFiltersInObservatory(oId, filter).catch((e) => {
                    toast.error(`Something went wrong while saving the filter! ${getErrorMessage(e) ?? e?.message}`);
                    setIsSaving(false);
                });
            }
        } else {
            const _localStorage = await loadFiltersFromLocalStorage();
            if (!filterId) {
                const _id = guid();
                asyncLocalStorage.setItem(
                    FILTERS_LOCAL_STORAGE_NAME,
                    JSON.stringify([..._localStorage, { id: _id, ...filter, source: FILTER_SOURCE.LOCAL_STORAGE }]),
                );
                setFilters([...filters, { id: _id, ...filter, source: FILTER_SOURCE.LOCAL_STORAGE }]);
            } else {
                asyncLocalStorage.setItem(
                    FILTERS_LOCAL_STORAGE_NAME,
                    JSON.stringify(
                        _localStorage.map((f) => (f.id === filterId ? { id: filterId, ...filter, source: FILTER_SOURCE.LOCAL_STORAGE } : f)),
                    ),
                );
                setFilters(filters.map((f) => (f.id === filterId ? { id: filterId, ...filter, source: FILTER_SOURCE.LOCAL_STORAGE } : f)));
            }
        }
        refreshFilters();
        setCurrentFilter(null);
        setIsSaving(false);
    };

    const deleteFilter = async (filter: FilterConfig) => {
        const isConfirmed = await Confirm({
            title: 'Are you sure?',
            message: 'Do you want to remove this filter?',
        });

        if (isConfirmed) {
            if (isCurationAllowed && filter.source === FILTER_SOURCE.DATABASE && filter.id) {
                await deleteFilterOfObservatory(oId, filter.id);
            }
            if (filter.source === FILTER_SOURCE.LOCAL_STORAGE && filter.id) {
                const _localStorage = await loadFiltersFromLocalStorage();
                asyncLocalStorage.setItem(FILTERS_LOCAL_STORAGE_NAME, JSON.stringify(_localStorage.filter((f) => f.id !== filter.id)));
            }
            setFilters(filters.filter((f) => f.id !== filter.id || (!f.id && !areFiltersEqual(filter, f))));
            refreshFilters();
        }
    };

    return {
        isSaving,
        currentFilter,
        handleSaveFilter,
        deleteFilter,
        setCurrentFilter,
    };
};

export default useCurateFilters;
