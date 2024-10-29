'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { getTemplates, getTemplatesParams, templatesUrl } from 'services/backend/templates';
import { VisibilityOptions } from 'services/backend/types';
import useSWRInfinite from 'swr/infinite';

const useTemplateGallery = ({ pageSize = 25 }: { pageSize?: number }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    // since the filters are not controlled by the user, we need to reset the key when the reset is called
    const [key, setKey] = useState(Date.now());

    const getKey = (pageIndex: number): getTemplatesParams => ({
        page: pageIndex,
        size: pageSize,
        sortBy: [{ property: 'created_at', direction: 'desc' }],
        visibility: searchParams.get('sort') as VisibilityOptions,
        research_field: searchParams.get('researchField') ?? undefined,
        include_subfields: searchParams.get('includeSubfields') ? searchParams.get('includeSubfields') === 'true' : undefined,
        researchProblem: searchParams.get('researchProblem'),
        targetClass: searchParams.get('targetClass'),
        q: searchParams.get('q'),
    });

    const { data, isLoading, isValidating, size, setSize } = useSWRInfinite(
        (pageIndex) => [getKey(pageIndex), templatesUrl, 'getTemplates'],
        ([params]) => getTemplates(params),
        { revalidateOnMount: true, revalidateAll: true },
    );

    const totalElements = data?.[0]?.totalElements;
    const isEmpty = totalElements === 0;
    const isLastPageReached = isEmpty || (data && data[data.length - 1])?.last;
    const hasNextPage = !isLastPageReached;
    const isLoadingTemplates = isLoading || isValidating;
    const handleLoadMore = () => setSize(size + 1);

    const isFilterApplied =
        searchParams.get('researchField')?.toString() ||
        searchParams.get('researchProblem')?.toString() ||
        searchParams.get('targetClass')?.toString() ||
        searchParams.get('q')?.toString();

    const resetFilters = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('sort');
        params.delete('researchField');
        params.delete('includeSubfields');
        params.delete('researchProblem');
        params.delete('targetClass');
        params.delete('q');
        router.push(`?${params.toString()}`);
        setKey(Date.now());
    };

    return {
        key,
        data,
        isLoadingTemplates,
        totalElements,
        isLastPageReached,
        hasNextPage,
        size,
        setSize,
        handleLoadMore,
        isFilterApplied,
        resetFilters,
    };
};

export default useTemplateGallery;
