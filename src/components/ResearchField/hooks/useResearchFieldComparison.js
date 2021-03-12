import { CLASSES } from 'constants/graphSettings';
import { find } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { getComparisonsByResearchFieldId } from 'services/backend/researchFields';
import { getResourcesByClass } from 'services/backend/resources';
import { getStatementsBySubjects } from 'services/backend/statements';
import { MISC } from 'constants/graphSettings';
import { getComparisonData } from 'utils';

function useResearchFieldComparison({ researchFieldId, initialSort, initialIncludeSubFields, pageSize = 10 }) {
    const [isLoading, setIsLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const [page, setPage] = useState(0);
    const [comparisons, setComparisons] = useState([]);
    const [sort, setSort] = useState(initialSort);
    const [totalElements, setTotalElements] = useState(0);
    const [includeSubFields, setIncludeSubFields] = useState(initialIncludeSubFields);

    const loadData = useCallback(
        page => {
            setIsLoading(true);
            // Comparisons
            let papersService;
            if (researchFieldId === MISC.RESEARCH_FIELD_MAIN) {
                papersService = getResourcesByClass({
                    id: sort === 'newest' || sort === 'featured' ? CLASSES.FEATURED_COMPARISON : CLASSES.COMPARISON,
                    sortBy: 'created_at',
                    desc: true,
                    items: pageSize
                });
            } else {
                papersService = getComparisonsByResearchFieldId({
                    id: researchFieldId,
                    page: page,
                    items: pageSize,
                    sortBy: 'created_at',
                    desc: sort === 'newest' ? true : false,
                    subfields: includeSubFields
                });
            }

            papersService
                .then(result => {
                    // Fetch the data of each comparison
                    getStatementsBySubjects({
                        ids: result.content.map(p => p.id)
                    })
                        .then(comparisonsStatements => {
                            const papers = comparisonsStatements.map(comparisonStatements => {
                                const resourceSubject = find(result.content, {
                                    id: comparisonStatements.id
                                });
                                return getComparisonData(resourceSubject, comparisonStatements.statements);
                            });

                            setComparisons(prevResources => [...prevResources, ...papers]);
                            setIsLoading(false);
                            setHasNextPage(!result.last);
                            setIsLastPageReached(result.last);
                            setTotalElements(result.totalElements);
                            setPage(page + 1);
                        })
                        .catch(error => {
                            setIsLoading(false);
                            setHasNextPage(false);
                            setIsLastPageReached(page > 1 ? true : false);

                            console.log(error);
                        });
                })
                .catch(error => {
                    setIsLoading(false);
                    setHasNextPage(false);
                    setIsLastPageReached(page > 1 ? true : false);

                    console.log(error);
                });
        },
        [includeSubFields, researchFieldId, sort, pageSize]
    );

    // reset resources when the researchFieldId has changed
    useEffect(() => {
        setComparisons([]);
        setHasNextPage(false);
        setIsLastPageReached(false);
        setPage(0);
        setTotalElements(0);
        if (researchFieldId !== MISC.RESEARCH_FIELD_MAIN && sort === 'featured') {
            // Because filtering featured comparison based on research field is not supported
            setSort('newest');
        }
    }, [researchFieldId, sort, includeSubFields]);

    useEffect(() => {
        loadData(0);
    }, [loadData]);

    const handleLoadMore = () => {
        if (!isLoading) {
            loadData(page);
        }
    };

    return {
        comparisons,
        isLoading,
        hasNextPage,
        isLastPageReached,
        sort,
        includeSubFields,
        totalElements,
        page,
        handleLoadMore,
        setIncludeSubFields,
        setSort
    };
}
export default useResearchFieldComparison;
