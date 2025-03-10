import { useCallback, useEffect, useState } from 'react';
import { ComparisonTopAuthor, getAuthorsByComparisonId } from 'services/backend/comparisons';
import { ResearchProblemTopAuthor, getAuthorsByResearchProblemId } from 'services/backend/problems';

function useTopAuthors({
    researchProblemId = null,
    comparisonId = null,
    pageSize = 5,
}: {
    researchProblemId?: string | null;
    comparisonId?: string | null;
    pageSize?: number;
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [isLast, setIsLast] = useState(false);
    const [page, setPage] = useState(0);
    const [authors, setAuthors] = useState<(ComparisonTopAuthor | ResearchProblemTopAuthor)[]>([]);

    const loadAuthors = useCallback(
        async (_page: number) => {
            setIsLoading(true);
            try {
                let result;

                if (researchProblemId) {
                    result = await getAuthorsByResearchProblemId({
                        id: researchProblemId,
                        page: _page,
                        size: pageSize,
                    });
                } else if (comparisonId) {
                    result = await getAuthorsByComparisonId({
                        id: comparisonId,
                        page: _page,
                        size: pageSize,
                    });
                }

                if (result && result.content.length > 0) {
                    setAuthors((prevResources) => [...prevResources, ...result!.content]);
                    setIsLast(result.page.number === result.page.total_pages - 1);
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

    return { authors, isLoading, page, isLast, loadNext };
}
export default useTopAuthors;
