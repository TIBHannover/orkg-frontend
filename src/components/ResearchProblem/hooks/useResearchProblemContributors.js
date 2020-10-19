import { useState, useEffect, useCallback } from 'react';
import { getContributorsByResearchProblemId } from 'services/backend/problems';
import { useParams } from 'react-router-dom';

function useResearchProblemContributors() {
    const pageSize = 25;
    const { researchProblemId } = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const [page, setPage] = useState(1);
    const [contributors, setContributors] = useState([]);

    const loadContributors = useCallback(
        page => {
            setIsLoading(true);
            // Get the Contributors of research problem
            getContributorsByResearchProblemId({
                id: researchProblemId,
                page: page,
                items: pageSize
            }).then(result => {
                if (result.length > 0) {
                    setContributors(prevResources => [...prevResources, ...result]);
                    setIsLoading(false);
                    setHasNextPage(result.length < pageSize || result.length === 0 ? false : true);
                    setIsLastPageReached(false);
                    setPage(page + 1);
                } else {
                    setIsLoading(false);
                    setHasNextPage(false);
                    setIsLastPageReached(page > 1 ? true : false);
                }
            });
        },
        [researchProblemId]
    );

    // reset resources when the researchProblemId has changed
    useEffect(() => {
        setContributors([]);
        setHasNextPage(false);
        setIsLastPageReached(false);
        setPage(1);
    }, [researchProblemId]);

    useEffect(() => {
        loadContributors(1);
    }, [loadContributors]);

    const handleLoadMore = () => {
        if (!isLoading) {
            loadContributors(page);
        }
    };

    return [contributors, isLoading, hasNextPage, isLastPageReached, page, handleLoadMore];
}
export default useResearchProblemContributors;
