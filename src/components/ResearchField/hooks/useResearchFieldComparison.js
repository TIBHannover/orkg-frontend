import { CLASSES, PREDICATES } from 'constants/graphSettings';
import { find } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { getStatementsByObjectAndPredicate, getStatementsBySubjects } from 'services/backend/statements';
import { getComparisonData } from 'utils';

function useResearchFieldComparison({ researchFieldId }) {
    const pageSize = 10;
    const [isLoading, setIsLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const [page, setPage] = useState(1);
    const [comparisons, setComparisons] = useState([]);

    const loadComparisons = useCallback(
        page => {
            setIsLoading(true);

            // Get the statements that contains the research field as an object
            getStatementsByObjectAndPredicate({
                objectId: researchFieldId,
                predicateId: PREDICATES.HAS_SUBJECT,
                page: page,
                items: pageSize,
                sortBy: 'created_at',
                desc: true
            }).then(result => {
                // Comparisons
                if (result.length > 0) {
                    // const parentResearchField = result.find(statement => statement.predicate.id === PREDICATES.HAS_SUB_RESEARCH_FIELD);
                    // Fetch the data of each paper
                    getStatementsBySubjects({
                        ids: result
                            .filter(paper => paper.subject.classes.includes(CLASSES.COMPARISON))
                            .filter(statement => statement.predicate.id === PREDICATES.HAS_SUBJECT)
                            .map(p => p.subject.id)
                    })
                        .then(comparisonsStatements => {
                            const comparisons = comparisonsStatements.map(comparisonStatements => {
                                const resourceSubject = find(result.map(p => p.subject), { id: comparisonStatements.id });
                                return getComparisonData(resourceSubject, comparisonStatements.statements);
                            });

                            setComparisons(prevResources => [...prevResources, ...comparisons]);
                            setIsLoading(false);
                            // use result instead of results because filtering by contribution class might reduce the number of items
                            setHasNextPage(comparisons.length < pageSize || comparisons.length === 0 ? false : true);
                            setIsLastPageReached(false);
                            setPage(page + 1);
                        })
                        .catch(error => {
                            setIsLoading(false);
                            setHasNextPage(false);
                            setIsLastPageReached(page > 1 ? true : false);

                            console.log(error);
                        });
                } else {
                    setIsLoading(false);
                    setHasNextPage(false);
                    setIsLastPageReached(page > 1 ? true : false);
                }
            });
        },
        [researchFieldId]
    );

    // reset resources when the researchFieldId has changed
    useEffect(() => {
        setComparisons([]);
        setHasNextPage(false);
        setIsLastPageReached(false);
        setPage(1);
    }, [researchFieldId]);

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
export default useResearchFieldComparison;
