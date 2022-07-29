import { useState, useEffect, useCallback } from 'react';
import { getStatementsBySubjects, getStatementsByObjectAndPredicate } from 'services/backend/statements';
import { CLASSES, PREDICATES } from 'constants/graphSettings';
import { getComparisonData, groupVersionsOfComparisons } from 'utils';
import { find, flatten } from 'lodash';

function useContributionComparison(contributionId) {
    const pageSize = 3;
    const [isLoading, setIsLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const [page, setPage] = useState(0);
    const [comparisons, setComparisons] = useState([]);

    const loadComparisons = useCallback(
        page => {
            setIsLoading(true);

            // Get the statements that contains the contribution as an object
            getStatementsByObjectAndPredicate({
                objectId: contributionId,
                predicateId: PREDICATES.COMPARE_CONTRIBUTION,
                page,
                items: pageSize,
                sortBy: 'created_at',
                desc: true,
            }).then(result => {
                // Comparisons
                if (result.filter(contribution => contribution.subject.classes.includes(CLASSES.COMPARISON)).length > 0) {
                    // Fetch the data of each comparison
                    getStatementsBySubjects({
                        ids: result.filter(contribution => contribution.subject.classes.includes(CLASSES.COMPARISON)).map(c => c.subject.id),
                    }).then(resourcesStatements => {
                        const comparisonsData = resourcesStatements.map(resourceStatements => {
                            const comparisonSubject = find(
                                result.filter(contribution => contribution.subject.classes.includes(CLASSES.COMPARISON)).map(c => c.subject),
                                {
                                    id: resourceStatements.id,
                                },
                            );
                            return getComparisonData(comparisonSubject, resourceStatements.statements);
                        });
                        Promise.all(comparisonsData).then(results => {
                            setComparisons(prevResources =>
                                groupVersionsOfComparisons([...flatten([...prevResources.map(c => c.versions), ...prevResources]), ...results]),
                            );
                            setIsLoading(false);
                            // use result instead of results because filtering by contribution class might reduce the number of items
                            setHasNextPage(!(result.length < pageSize || result.length === 0));
                            setIsLastPageReached(false);
                            setPage(page + 1);
                        });
                    });
                } else {
                    setIsLoading(false);
                    setHasNextPage(false);
                    setIsLastPageReached(page > 1);
                }
            });
        },
        [contributionId],
    );

    // reset resources when the contributionId has changed
    useEffect(() => {
        setComparisons([]);
        setHasNextPage(false);
        setIsLastPageReached(false);
        setPage(0);
    }, [contributionId]);

    useEffect(() => {
        loadComparisons(0);
    }, [loadComparisons]);

    const handleLoadMore = () => {
        if (!isLoading) {
            loadComparisons(page);
        }
    };

    return [comparisons, isLoading, hasNextPage, isLastPageReached, handleLoadMore];
}
export default useContributionComparison;
