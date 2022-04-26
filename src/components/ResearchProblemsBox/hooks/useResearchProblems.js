import { useCallback, useEffect, useState } from 'react';
import { mergeAlternate } from 'utils';
import { getContentByObservatoryIdAndClasses } from 'services/backend/observatories';
import { getResearchProblemsByResearchFieldId } from 'services/backend/researchFields';
import { CLASSES } from 'constants/graphSettings';

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
        (page, total) => {
            const apiFunc = by === 'ResearchField' ? getResearchProblemsByResearchFieldId : getContentByObservatoryIdAndClasses;
            setIsLoading(true);
            // problems
            let problemsService;
            if (sort === 'combined') {
                // in case of combined sort we list 50% featured and 50% newest items (new not featured)
                const newService = apiFunc({
                    id: id,
                    page: page,
                    items: Math.round(pageSize / 2),
                    sortBy: 'created_at',
                    desc: true,
                    ...(by === 'ResearchField' ? { subfields: includeSubFields } : {}),
                    ...(by === 'Observatory' ? { classes: [CLASSES.PROBLEM] } : {}),
                    featured: false,
                    unlisted: false
                });
                const featuredService = apiFunc({
                    id: id,
                    page: page,
                    items: Math.round(pageSize / 2),
                    sortBy: 'created_at',
                    desc: true,
                    ...(by === 'ResearchField' ? { subfields: includeSubFields } : {}),
                    ...(by === 'Observatory' ? { classes: [CLASSES.PROBLEM] } : {}),
                    featured: true,
                    unlisted: false
                });
                problemsService = Promise.all([newService, featuredService]).then(([newC, featuredC]) => {
                    const combinedC = mergeAlternate(newC.content, featuredC.content);
                    return {
                        content: combinedC,
                        totalElements: page === 0 ? newC.totalElements + featuredC.totalElements : total,
                        last: newC.last && featuredC.last
                    };
                });
            } else {
                problemsService = apiFunc({
                    id: id,
                    page: page,
                    items: pageSize,
                    sortBy: 'created_at',
                    desc: true,
                    ...(by === 'ResearchField' ? { subfields: includeSubFields } : {}),
                    ...(by === 'Observatory' ? { classes: [CLASSES.PROBLEM] } : {}),
                    featured: sort === 'featured' ? true : null,
                    unlisted: sort === 'unlisted' ? true : false
                });
            }
            problemsService
                .then(result => {
                    setProblems(prevResources => [...prevResources, ...result.content]);
                    setIsLoading(false);
                    setHasNextPage(!result.last);
                    setIsLastPageReached(result.last);
                    setTotalElements(result.totalElements);
                    setPage(page + 1);
                })
                .catch(error => {
                    setProblems([]);
                    setIsLoading(false);
                    setHasNextPage(false);
                    setIsLastPageReached(page > 1 ? true : false);
                });
        },
        [sort, id, pageSize, by, includeSubFields]
    );

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
        setSort
    };
}
export default useResearchProblems;
