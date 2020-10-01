import { useState, useEffect, useCallback } from 'react';
import { getStatementsBySubjects, getStatementsByObjectAndPredicate } from 'network';
import { CLASSES, PREDICATES } from 'constants/graphSettings';
import { getComparisonData } from 'utils';
import { find } from 'lodash';

function useContributionComparison(contributionId) {
    const pageSize = 3;
    const [isLoading, setIsLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const [page, setPage] = useState(1);
    const [comparisons, setComparisons] = useState([]);

    const loadComparisons = useCallback(
        page => {
            setIsLoading(true);

            // Get the statements that contains the research problem as an object
            getStatementsByObjectAndPredicate({
                objectId: contributionId,
                predicateId: PREDICATES.COMPARE_CONTRIBUTION,
                page: page,
                items: pageSize,
                sortBy: 'created_at',
                desc: true
            }).then(result => {
                // Comparisons
                if (result.length > 0) {
                    // Fetch the data of each comparison
                    getStatementsBySubjects({
                        ids: result.filter(contribution => contribution.subject.classes.includes(CLASSES.COMPARISON)).map(c => c.subject.id)
                    }).then(resourcesStatements => {
                        const comparisonsData = resourcesStatements.map(resourceStatements => {
                            const comparisonSubject = find(
                                result.filter(contribution => contribution.subject.classes.includes(CLASSES.COMPARISON)).map(c => c.subject),
                                {
                                    id: resourceStatements.id
                                }
                            );
                            return getComparisonData(
                                resourceStatements.id,
                                resourceStatements && comparisonSubject.label ? comparisonSubject.label : 'No Title',
                                resourceStatements.statements
                            );
                        });
                        Promise.all(comparisonsData).then(results => {
                            setComparisons(prevResources => [...prevResources, ...results]);
                            setIsLoading(false);
                            // use result instead of results because filtering by contribution class might reduce the number of items
                            setHasNextPage(result.length < pageSize || result.length === 0 ? false : true);
                            setIsLastPageReached(false);
                            setPage(page + 1);
                        });
                    });
                } else {
                    setIsLoading(false);
                    setHasNextPage(false);
                    setIsLastPageReached(page > 1 ? true : false);
                }
            });
        },
        [contributionId]
    );

    // reset resources when the contributionId has changed
    useEffect(() => {
        setComparisons([]);
        setHasNextPage(false);
        setIsLastPageReached(false);
        setPage(1);
    }, [contributionId]);

    useEffect(() => {
        loadComparisons(1);
    }, [loadComparisons]);

    const handleLoadMore = () => {
        if (!isLoading) {
            loadComparisons(page);
        }
    };

    return [comparisons, isLoading, hasNextPage, isLastPageReached, handleLoadMore];
}
export default useContributionComparison;
