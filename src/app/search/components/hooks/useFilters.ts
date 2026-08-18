import { isString } from 'lodash';
import { parseAsInteger, useQueryState } from 'nuqs';
import { useEffect, useState } from 'react';
import { useUpdateEffect } from 'react-use';
import useSWR from 'swr';

import { contributorsUrl, getContributorById } from '@/services/backend/contributors';
import { getObservatoryById, observatoriesUrl } from '@/services/backend/observatories';
import { getOrganization, organizationsUrl } from '@/services/backend/organizations';

const useFilters = () => {
    const [searchTerm, setSearchTerm] = useQueryState('q', { defaultValue: '' });
    const [type, setType] = useQueryState('type', { defaultValue: '' });
    const [excludeType, setExcludeType] = useQueryState('excludeType', { defaultValue: '' });
    const [createdBy, setCreatedBy] = useQueryState('createdBy', { defaultValue: '' });
    const [observatoryId, setObservatoryId] = useQueryState('observatoryId', { defaultValue: '' });
    const [organizationId, setOrganizationId] = useQueryState('organizationId', { defaultValue: '' });
    const [createdAtStart, setCreatedAtStart] = useQueryState('createdAtStart', { defaultValue: '' });
    const [createdAtEnd, setCreatedAtEnd] = useQueryState('createdAtEnd', { defaultValue: '' });
    const [, setPage] = useQueryState('page', parseAsInteger.withDefault(0));

    const { data: createdByData, isLoading: isLoadingContributor } = useSWR(
        createdBy ? [createdBy, contributorsUrl, 'getContributorById'] : null,
        ([params]) => getContributorById(params),
    );

    const { data: observatoryData, isLoading: isLoadingObservatory } = useSWR(
        observatoryId ? [observatoryId, observatoriesUrl, 'getObservatoryById'] : null,
        ([params]) => getObservatoryById(params),
    );

    const { data: organizationData, isLoading: isLoadingOrganization } = useSWR(
        organizationId ? [organizationId, organizationsUrl, 'getOrganization'] : null,
        ([params]) => getOrganization(params),
        { shouldRetryOnError: false },
    );

    const [value, setValue] = useState(searchTerm ?? '');

    const handleSubmitSearch = (_value: string) => {
        if (isString(_value)) {
            setSearchTerm(_value);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setValue(searchTerm ?? '');
    }, [searchTerm]);

    // Update the page when the filters change, ignore the first render because the page might be visited with a page number
    useUpdateEffect(() => {
        setPage(0);
    }, [createdBy, observatoryId, organizationId, createdAtStart, createdAtEnd, excludeType, setPage, type]);

    // Type and Exclude type are mutually exclusive; centralized here so every caller (fields + chips) shares the same guard
    const selectType = (id: string) => {
        setType(id);
        if (id && id === excludeType) {
            setExcludeType('');
        }
    };

    const selectExcludeType = (id: string) => {
        setExcludeType(id);
        if (id && id === type) {
            setType('');
        }
    };

    const clearFilter = () => {
        setCreatedBy('');
        setObservatoryId('');
        setOrganizationId('');
        setCreatedAtStart('');
        setCreatedAtEnd('');
        setType('');
        setExcludeType('');
    };

    const isFilterApplied = !!createdBy || !!observatoryId || !!organizationId || !!createdAtStart || !!createdAtEnd || !!type || !!excludeType;

    return {
        searchTerm,
        value,
        createdBy,
        setCreatedBy,
        setValue,
        handleSubmitSearch,
        type,
        setType: selectType,
        excludeType,
        setExcludeType: selectExcludeType,
        observatoryId,
        setObservatoryId,
        observatoryData,
        isLoadingObservatory,
        organizationId,
        setOrganizationId,
        organizationData,
        isLoadingOrganization,
        createdAtStart,
        setCreatedAtStart,
        createdAtEnd,
        setCreatedAtEnd,
        createdByData,
        isLoadingContributor,
        clearFilter,
        isFilterApplied,
    };
};

export default useFilters;
