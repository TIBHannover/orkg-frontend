import { isString } from 'lodash';
import { parseAsInteger, useQueryState } from 'nuqs';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

import { contributorsUrl, getContributorInformationById } from '@/services/backend/contributors';
import { getObservatoryById, observatoriesUrl } from '@/services/backend/observatories';

const useFilters = () => {
    const [searchTerm, setSearchTerm] = useQueryState('q', { defaultValue: '' });
    const [type, setType] = useQueryState('type', { defaultValue: '' });
    const [createdBy, setCreatedBy] = useQueryState('createdBy', { defaultValue: '' });
    const [observatoryId, setObservatoryId] = useQueryState('observatoryId', { defaultValue: '' });
    const [, setPage] = useQueryState('page', parseAsInteger.withDefault(0));

    const { data: createdByData, isLoading: isLoadingContributor } = useSWR(
        createdBy ? [createdBy, contributorsUrl, 'getContributorInformationById'] : null,
        ([params]) => getContributorInformationById(params),
    );

    const { data: observatoryData, isLoading: isLoadingObservatory } = useSWR(
        observatoryId ? [observatoryId, observatoriesUrl, 'getObservatoryById'] : null,
        ([params]) => getObservatoryById(params),
    );

    const [value, setValue] = useState(searchTerm ?? '');

    const handleSubmitSearch = (_value: string) => {
        if (isString(_value)) {
            setSearchTerm(_value);
        }
    };

    useEffect(() => {
        setValue(searchTerm ?? '');
    }, [searchTerm]);

    useEffect(() => {
        setPage(0);
    }, [createdBy, observatoryId, setPage, type]);

    const clearFilter = () => {
        setCreatedBy('');
        setObservatoryId('');
        setType('');
    };

    const isFilterApplied = !!createdBy || !!observatoryId || !!type;

    return {
        searchTerm,
        value,
        createdBy,
        setCreatedBy,
        setValue,
        handleSubmitSearch,
        type,
        setType,
        observatoryId,
        setObservatoryId,
        observatoryData,
        isLoadingObservatory,
        createdByData,
        isLoadingContributor,
        clearFilter,
        isFilterApplied,
    };
};

export default useFilters;
