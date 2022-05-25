import { useState, useEffect, useCallback } from 'react';
import { getContributorsByResearchProblemId } from 'services/backend/problems';

function useResearchProblemContributors({ researchProblemId, pageSize = 30 }) {
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingFailed, setIsLoadingFailed] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const [page, setPage] = useState(0);
    const [contributors, setContributors] = useState([]);

    const loadContributors = useCallback(
        page => {
            setIsLoading(true);
            // Get the Contributors of research problem
            getContributorsByResearchProblemId({
                id: researchProblemId,
                page,
                items: pageSize,
            })
                .then(result => {
                    if (result.length > 0) {
                        setContributors(prevResources => [...prevResources, ...result]);
                        setIsLoading(false);
                        setHasNextPage(!(result.length < pageSize || result.length === 0));
                        setIsLastPageReached(false);
                        setPage(page + 1);
                        setIsLoadingFailed(false);
                    } else {
                        setIsLoading(false);
                        setHasNextPage(false);
                        setIsLastPageReached(page > 0);
                        setIsLoadingFailed(false);
                    }
                })
                .catch(e => {
                    setContributors([]);
                    setIsLoading(false);
                    setHasNextPage(false);
                    setIsLastPageReached(true);
                    setIsLoadingFailed(true);
                });
        },
        [researchProblemId, pageSize],
    );

    // reset resources when the researchProblemId has changed
    useEffect(() => {
        setContributors([]);
        setHasNextPage(false);
        setIsLastPageReached(false);
        setPage(0);
    }, [researchProblemId]);

    useEffect(() => {
        loadContributors(0);
    }, [loadContributors]);

    const handleLoadMore = () => {
        if (!isLoading) {
            loadContributors(page);
        }
    };

    return { contributors, isLoading, isLoadingFailed, hasNextPage, isLastPageReached, page, handleLoadMore };
}
export default useResearchProblemContributors;
