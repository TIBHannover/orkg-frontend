import { useState, useEffect, useCallback } from 'react';
import { getContributorsByResourceId } from 'services/backend/resources';

function useTimeline(id) {
    const [isNextPageLoading, setIsNextPageLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [page, setPage] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const pageSize = 30;
    const [contributors, setContributors] = useState([]);

    const loadMore = useCallback(
        p => {
            setIsNextPageLoading(true);
            getContributorsByResourceId({ id, page: p, size: pageSize })
                .then(result => {
                    setContributors(prevContributors => [...prevContributors, ...result.content]);
                    setIsNextPageLoading(false);
                    setHasNextPage(!result.last);
                    setIsLastPageReached(result.last);
                    setTotalElements(result.totalElements);
                    setPage(p + 1);
                })
                .catch(() => {
                    setContributors(prevContributors => (p > 0 ? prevContributors : []));
                    setIsNextPageLoading(false);
                    setHasNextPage(false);
                    setIsLastPageReached(p > 1);
                });
        },
        [id],
    );

    // reset resources when the id has changed
    useEffect(() => {
        setContributors([]);
        setHasNextPage(false);
        setIsLastPageReached(false);
        setPage(0);
        setTotalElements(0);
    }, []);

    useEffect(() => {
        loadMore(0);
    }, [loadMore]);

    const handleLoadMore = useCallback(() => {
        if (!isNextPageLoading) {
            loadMore(page);
        }
    }, [isNextPageLoading, loadMore, page]);

    return { isNextPageLoading, hasNextPage, contributors, totalElements, isLastPageReached, handleLoadMore };
}
export default useTimeline;
