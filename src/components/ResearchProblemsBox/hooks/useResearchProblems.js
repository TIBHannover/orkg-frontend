import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { VISIBILITY_FILTERS } from '@/constants/contentTypes';
import { CLASSES, MISC } from '@/constants/graphSettings';
import { getContentTypes } from '@/services/backend/contentTypes';
import { getResearchProblemsByResearchFieldId } from '@/services/backend/researchFields';
import { updateResource } from '@/services/backend/resources';
import { mergeAlternate } from '@/utils';

function useResearchProblems({ id, by = 'ResearchField', initialSort, initialIncludeSubFields, pageSize = 10 }) {
    const [isLoading, setIsLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const [page, setPage] = useState(0);
    const [problems, setProblems] = useState([]);
    const [sort, setSort] = useState(initialSort);
    const [totalElements, setTotalElements] = useState(0);
    const [includeSubFields, setIncludeSubFields] = useState(initialIncludeSubFields);

    const loadData = useCallback(
        (_page, total) => {
            const apiFunc = by === 'ResearchField' ? getResearchProblemsByResearchFieldId : getContentTypes;
            setIsLoading(true);
            // problems
            let problemsService;
            if (sort === 'combined') {
                // in case of combined sort we list 50% featured and 50% newest items (new not featured)
                const newService = apiFunc({
                    ...(by === 'ResearchField' ? { id } : { observatory_id: id }),
                    page: _page,
                    size: Math.round(pageSize / 2),
                    sortBy: by === 'ResearchField' ? 'created_at' : [{ property: 'created_at', direction: 'desc' }],
                    desc: true,
                    ...(by === 'ResearchField' ? { subfields: includeSubFields } : {}),
                    ...(by === 'Observatory' ? { contentType: CLASSES.PROBLEM } : {}),
                    visibility: VISIBILITY_FILTERS.NON_FEATURED,
                });
                const featuredService = apiFunc({
                    ...(by === 'ResearchField' ? { id } : { observatory_id: id }),
                    page: _page,
                    size: Math.round(pageSize / 2),
                    sortBy: by === 'ResearchField' ? 'created_at' : [{ property: 'created_at', direction: 'desc' }],
                    desc: true,
                    ...(by === 'ResearchField' ? { subfields: includeSubFields } : {}),
                    ...(by === 'Observatory' ? { contentType: CLASSES.PROBLEM } : {}),
                    visibility: VISIBILITY_FILTERS.FEATURED,
                });
                problemsService = Promise.all([newService, featuredService]).then(([newC, featuredC]) => {
                    const combinedC = mergeAlternate(newC.content, featuredC.content);
                    return {
                        content: combinedC,
                        page: {
                            total_elements: _page === 0 ? newC.page.total_elements + featuredC.page.total_elements : total,
                            number: _page,
                            total_pages: newC.page.number === newC.page.total_pages && featuredC.page.number === featuredC.page.total_pages ? 1 : 2,
                        },
                    };
                });
            } else {
                problemsService = apiFunc({
                    ...(by === 'ResearchField' ? { id } : { observatory_id: id }),
                    page: _page,
                    size: pageSize,
                    sortBy: by === 'ResearchField' ? 'created_at' : [{ property: 'created_at', direction: 'desc' }],
                    ...(by === 'ResearchField' ? { desc: true } : {}),
                    ...(by === 'ResearchField' ? { subfields: includeSubFields } : {}),
                    ...(by === 'Observatory' ? { contentType: CLASSES.PROBLEM } : {}),
                    visibility: sort,
                });
            }
            problemsService
                .then((result) => {
                    setProblems((prevResources) => [...prevResources, ...result.content]);
                    setIsLoading(false);
                    setHasNextPage(result.page.number < result.page.total_pages - 1);
                    setIsLastPageReached(result.page.number === result.page.total_pages - 1);
                    setTotalElements(result.page.total_elements);
                    setPage(_page + 1);
                })
                .catch(() => {
                    setProblems([]);
                    setIsLoading(false);
                    setHasNextPage(false);
                    setIsLastPageReached(_page > 1);
                });
        },
        [sort, id, pageSize, by, includeSubFields],
    );

    const deleteResearchProblem = async (researchProblem) => {
        try {
            await updateResource(researchProblem.id, { observatory_id: MISC.UNKNOWN_ID, organization_id: MISC.UNKNOWN_ID });
            setProblems((v) => v.filter((t) => t.id !== researchProblem.id));
            setTotalElements((r) => r - 1);
            toast.success('Research problem deleted successfully');
        } catch (error) {
            toast.error('error deleting a research problem');
        }
    };

    // reset resources when the researchFieldId has changed
    useEffect(() => {
        setProblems([]);
        setHasNextPage(false);
        setIsLastPageReached(false);
        setPage(0);
        setTotalElements(0);
    }, [id, includeSubFields, sort]);

    useEffect(() => {
        loadData(0);
    }, [loadData]);

    const handleLoadMore = () => {
        if (!isLoading) {
            loadData(page, totalElements);
        }
    };

    return {
        problems,
        isLoading,
        hasNextPage,
        isLastPageReached,
        sort,
        includeSubFields,
        totalElements,
        page,
        setProblems,
        handleLoadMore,
        setIncludeSubFields,
        setSort,
        deleteResearchProblem,
        setTotalElements,
    };
}
export default useResearchProblems;
