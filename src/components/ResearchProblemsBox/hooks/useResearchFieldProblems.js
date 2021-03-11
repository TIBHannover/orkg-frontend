import { useState, useEffect, useCallback } from 'react';
import { getResearchProblemsByResearchFieldId } from 'services/backend/researchFields';
import { orderBy } from 'lodash';

function useResearchFieldProblems({ researchFieldId, pageSize = 10 }) {
    const [isLoading, setIsLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const [page, setPage] = useState(0);
    const [problems, setProblems] = useState([]);
    const [totalElements, setTotalElements] = useState(0);

    const loadData = useCallback(
        page => {
            setIsLoading(true);
            // Get the problems of research field
            getResearchProblemsByResearchFieldId({
                id: researchFieldId,
                page: page,
                items: pageSize
            })
                .then(result => {
                    setProblems(prevResources => orderBy([...prevResources, ...result.content], ['papers'], ['desc']));
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
        [pageSize, researchFieldId]
    );

    // reset resources when the researchProblemId has changed
    useEffect(() => {
        setProblems([]);
        setHasNextPage(false);
        setIsLastPageReached(false);
        setPage(0);
        setTotalElements(0);
    }, [researchFieldId]);

    useEffect(() => {
        loadData(0);
    }, [loadData]);

    const handleLoadMore = () => {
        if (!isLoading) {
            loadData(page);
        }
    };

    return {
        problems,
        isLoading,
        hasNextPage,
        isLastPageReached,
        totalElements,
        page,
        handleLoadMore
    };
}
export default useResearchFieldProblems;
