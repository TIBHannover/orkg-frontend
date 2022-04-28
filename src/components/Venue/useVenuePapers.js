import { useState, useEffect, useCallback } from 'react';
import { getStatementsByObjectAndPredicate, getStatementsBySubjects } from 'services/backend/statements';
import { find } from 'lodash';
import { PREDICATES } from 'constants/graphSettings';
import { getPaperData } from 'utils';

function useVenuePapers({ venueId }) {
    const [isNextPageLoading, setIsNextPageLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [page, setPage] = useState(0);
    const [papers, setPapers] = useState([]);
    const [totalElements, setTotalElements] = useState(0);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const pageSize = 25;

    const loadMoreWorks = useCallback(
        p => {
            setIsNextPageLoading(true);
            // Get the statements that contains the author as an object
            getStatementsByObjectAndPredicate({
                objectId: venueId,
                predicateId: PREDICATES.HAS_VENUE,
                page: p,
                items: pageSize,
                sortBy: 'created_at',
                desc: true,
                returnContent: false
            }).then(result => {
                // Fetch the data of each work
                if (result.content?.length) {
                    return getStatementsBySubjects({
                        ids: result.content.map(p => p.subject.id)
                    })
                        .then(statements => {
                            const items = statements.map(itemStatements => {
                                const itemSubject = find(result.content.map(p => p.subject), { id: itemStatements.id });
                                return getPaperData(itemSubject, itemStatements.statements);
                            });

                            setPapers(prevResources => [...prevResources, ...items]);
                            setIsNextPageLoading(false);
                            setHasNextPage(!result.last);
                            setIsLastPageReached(result.last);
                            setTotalElements(result.totalElements);
                            setPage(p + 1);
                        })
                        .catch(error => {
                            setPapers([]);
                            setIsNextPageLoading(false);
                            setHasNextPage(false);
                            setIsLastPageReached(p > 1 ? true : false);
                        });
                } else {
                    setIsNextPageLoading(false);
                    setHasNextPage(false);
                    setIsLastPageReached(true);
                }
            });
        },
        [venueId]
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
