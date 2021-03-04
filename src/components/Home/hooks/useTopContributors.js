import { useCallback, useEffect, useState } from 'react';
import { getTopContributors } from 'services/backend/stats';

function useResearchFieldProblems() {
    const pageSize = 30;
    const [isLoading, setIsLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const [page, setPage] = useState(0);
    const [contributors, setContributors] = useState([]);
    const [totalElements, setTotalElements] = useState(0);

    const loadData = useCallback(page => {
        setIsLoading(true);
        // Papers
        getTopContributors({
            page: page,
            items: pageSize,
            sortBy: 'created_at'
        })
            .then(result => {
                setContributors(prevResources => [...prevResources, ...result.content]);
                setIsLoading(false);
                setHasNextPage(!result.last);
                setIsLastPageReached(result.last);
                setTotalElements(result.totalElements);
                setPage(page + 1);
            })
            .catch(error => {
                setIsLoading(false);
                setHasNextPage(false);
                setIsLastPageReached(page > 1 ? true : false);

                console.log(error);
            });
    }, []);

    // reset resources when the researchFieldId has changed
    useEffect(() => {
        setContributors([]);
        setHasNextPage(false);
        setIsLastPageReached(false);
        setPage(0);
        setTotalElements(0);
    }, []);

    useEffect(() => {
        loadData(0);
    }, [loadData]);

    const handleLoadMore = () => {
        if (!isLoading) {
            loadData(page);
        }
    };

    return {
        contributors,
        isLoading,
        hasNextPage,
        isLastPageReached,
        totalElements,
        page,
        handleLoadMore
    };
}
export default useResearchFieldProblems;
