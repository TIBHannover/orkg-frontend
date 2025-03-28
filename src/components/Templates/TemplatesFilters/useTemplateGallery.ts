'use client';

import { useQueryState } from 'nuqs';
import { useState } from 'react';

import usePaginate from '@/components/PaginatedContent/hooks/usePaginate';
import { getTemplates, templatesUrl } from '@/services/backend/templates';

const useTemplateGallery = ({ pageSize = 25 }: { pageSize?: number }) => {
    const [searchTerm, setSearchTerm] = useQueryState('q', {
        defaultValue: '',
    });
    const [researchField, setResearchField] = useQueryState('researchField', {
        defaultValue: '',
    });
    const [includeSubFields, setIncludeSubFields] = useQueryState('include_subfields', {
        defaultValue: true,
        parse: (value) => value === 'true',
    });

    const [researchProblem, setResearchProblem] = useQueryState('researchProblem', {
        defaultValue: '',
    });
    const [targetClass, setTargetClass] = useQueryState('targetClass', {
        defaultValue: '',
    });

    // since the filters are not controlled by the user, we need to reset the key when the reset is called
    const [key, setKey] = useState(Date.now());

    const {
        data: items,
        isLoading,
        totalElements,
        hasNextPage,
        page,
        totalPages,
        setPage,
        error,
        setPageSize,
    } = usePaginate({
        fetchFunction: getTemplates,
        fetchUrl: templatesUrl,
        fetchFunctionName: 'getTemplates',
        fetchExtraParams: {
            q: searchTerm,
            ...(researchField ? { research_field: researchField } : {}),
            ...(includeSubFields ? { include_subfields: includeSubFields } : {}),
            ...(researchProblem ? { researchProblem } : {}),
            ...(targetClass ? { targetClass } : {}),
        },
        defaultPageSize: pageSize,
        defaultSortBy: 'created_at',
    });

    const isFilterApplied = researchField || researchProblem || targetClass || searchTerm;

    const resetFilters = () => {
        setSearchTerm(null);
        setResearchField(null);
        setIncludeSubFields(null);
        setResearchProblem(null);
        setTargetClass(null);
        setPage(0);
        setKey(Date.now());
    };

    return {
        key,
        items,
        isLoading,
        totalElements,
        hasNextPage,
        page,
        totalPages,
        setPage,
        error,
        pageSize,
        setPageSize,
        isFilterApplied,
        resetFilters,
    };
};

export default useTemplateGallery;
