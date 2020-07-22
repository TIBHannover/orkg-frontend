import { useState, useEffect, useCallback } from 'react';
import { getAuthorsByResearchProblemId } from 'network';
import { useParams } from 'react-router-dom';

function useResearchProblemAuthors() {
    const pageSize = 25;
    const { researchProblemId } = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const [page, setPage] = useState(1);
    const [authors, setAuthors] = useState([]);

    const loadAuthors = useCallback(
        page => {
            setIsLoading(true);
            // Get the Authors of research problem
            getAuthorsByResearchProblemId({
                id: researchProblemId,
                page: page,
                items: pageSize
            }).then(result => {
                if (result.length > 0) {
                    setAuthors(prevResources => [...prevResources, ...result]);
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
        setAuthors([]);
        setHasNextPage(false);
        setIsLastPageReached(false);
        setPage(1);
    }, [researchProblemId]);

    useEffect(() => {
        loadAuthors(1);
    }, [loadAuthors]);

    const handleLoadMore = () => {
        if (!isLoading) {
            loadAuthors(page);
        }
    };

    return [authors, isLoading, hasNextPage, isLastPageReached, page, handleLoadMore];
}
export default useResearchProblemAuthors;
