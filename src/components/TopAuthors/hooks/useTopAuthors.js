import { useState, useEffect, useCallback } from 'react';
import { getAuthorsByComparisonId } from 'services/backend/comparisons';
import { getAuthorsByResearchProblemId } from 'services/backend/problems';

function useTopAuthors({ researchProblemId = null, comparisonId = null, pageSize = 5 }) {
    const [isLoading, setIsLoading] = useState(false);
    const [isLast, setIsLast] = useState(false);
    const [page, setPage] = useState(0);
    const [authors, setAuthors] = useState([]);

    const loadAuthors = useCallback(
        async _page => {
            setIsLoading(true);
            try {
                const result = researchProblemId
                    ? await getAuthorsByResearchProblemId({
                          id: researchProblemId,
                          page: _page,
                          items: pageSize,
                      })
                    : await getAuthorsByComparisonId({
                          id: comparisonId,
                          page: _page,
                          items: pageSize,
                      });

                if (result.content.length > 0) {
                    setAuthors(prevResources => [...prevResources, ...result.content]);
                    setIsLast(result.last);
                    setIsLoading(false);
                    setPage(_page + 1);
                } else {
                    setIsLoading(false);
                    setIsLast(true);
                }
            } catch (e) {
                setAuthors([]);
                setIsLoading(false);
            }
        },
        [comparisonId, pageSize, researchProblemId],
    );

    const loadNext = () => {
        loadAuthors(page);
    };

    // reset resources when the researchProblemId has changed
    useEffect(() => {
        setAuthors([]);
        setPage(0);
    }, [researchProblemId]);

    useEffect(() => {
        loadAuthors(0);
    }, [loadAuthors]);

    const handleLoadMore = () => {
        if (!isLoading) {
            loadAuthors(page);
        }
    };

    return { authors, isLoading, page, handleLoadMore, isLast, loadNext };
}
export default useTopAuthors;
