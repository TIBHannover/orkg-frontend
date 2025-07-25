import { find } from 'lodash';
import { useCallback, useEffect, useState } from 'react';

import { PREDICATES } from '@/constants/graphSettings';
import { getStatements, getStatementsBySubjects } from '@/services/backend/statements';
import { addAuthorsToStatementBundle, getPaperData } from '@/utils';

function useVenuePapers({ venueId }) {
    const [isNextPageLoading, setIsNextPageLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [page, setPage] = useState(0);
    const [papers, setPapers] = useState([]);
    const [totalElements, setTotalElements] = useState(0);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const pageSize = 25;

    const loadMoreWorks = useCallback(
        (p) => {
            setIsNextPageLoading(true);
            // Get the statements that contains the author as an object
            getStatements({
                objectId: venueId,
                predicateId: PREDICATES.HAS_VENUE,
                page: p,
                size: pageSize,
                sortBy: [{ property: 'created_at', direction: 'desc' }],
                returnContent: false,
            }).then((result) => {
                // Fetch the data of each work
                if (result.content?.length) {
                    return getStatementsBySubjects({
                        ids: result.content.map((p) => p.subject.id),
                    })
                        .then((statements) => addAuthorsToStatementBundle(statements))
                        .then((statements) => {
                            const items = statements.map((itemStatements) => {
                                const itemSubject = find(
                                    result.content.map((p) => p.subject),
                                    { id: itemStatements.id },
                                );
                                return getPaperData(itemSubject, itemStatements.statements);
                            });

                            setPapers((prevResources) => [...prevResources, ...items]);
                            setIsNextPageLoading(false);
                            setHasNextPage(result.page.number < result.page.total_pages - 1);
                            setIsLastPageReached(result.page.number === result.page.total_pages - 1);
                            setTotalElements(result.page.total_elements);
                            setPage(p + 1);
                        })
                        .catch((error) => {
                            setPapers([]);
                            setIsNextPageLoading(false);
                            setHasNextPage(false);
                            setIsLastPageReached(p > 1);
                        });
                }
                setIsNextPageLoading(false);
                setHasNextPage(false);
                setIsLastPageReached(true);
            });
        },
        [venueId],
    );
    // reset resources when the venueId has changed
    useEffect(() => {
        setPapers([]);
        setHasNextPage(false);
        setIsLastPageReached(false);
        setPage(0);
        setTotalElements(0);
    }, []);

    useEffect(() => {
        loadMoreWorks(0);
    }, [loadMoreWorks]);

    const handleLoadMore = useCallback(() => {
        if (!isNextPageLoading) {
            loadMoreWorks(page);
        }
    }, [isNextPageLoading, loadMoreWorks, page]);

    return { isNextPageLoading, hasNextPage, papers, totalElements, isLastPageReached, handleLoadMore };
}
export default useVenuePapers;
