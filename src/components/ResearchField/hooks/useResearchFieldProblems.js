import { useState, useEffect, useCallback } from 'react';
import { getResearchProblemsByResearchFieldId } from 'services/backend/research-fields';
import { useParams } from 'react-router-dom';

function useResearchFieldProblems() {
    const pageSize = 10;
    const { researchFieldId } = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const [page, setPage] = useState(1);
    const [problems, setProblems] = useState([]);

    const loadProblems = useCallback(
        page => {
            setIsLoading(true);
            // Get the problems of research field
            getResearchProblemsByResearchFieldId({
                id: researchFieldId,
                page: page,
                items: pageSize
            }).then(result => {
                if (result.length > 0) {
                    setProblems(prevResources => [...prevResources, ...result]);
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
        [researchFieldId]
    );

    // reset resources when the researchProblemId has changed
    useEffect(() => {
        setProblems([]);
        setHasNextPage(false);
        setIsLastPageReached(false);
        setPage(1);
    }, [researchFieldId]);

    useEffect(() => {
        loadProblems(1);
    }, [loadProblems]);

    const handleLoadMore = () => {
        if (!isLoading) {
            loadProblems(page);
        }
    };

    return [problems, isLoading, hasNextPage, isLastPageReached, page, handleLoadMore];
}
export default useResearchFieldProblems;
