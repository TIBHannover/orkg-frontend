import { CLASSES } from 'constants/graphSettings';
import { find } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { getComparisonsByResearchFieldId } from 'services/backend/researchFields';
import { getResourcesByClass } from 'services/backend/resources';
import { getStatementsBySubjects } from 'services/backend/statements';
import { MISC } from 'constants/graphSettings';
import { getComparisonData, groupVersionsOfComparisons, mergeAlternate } from 'utils';
import { flatten } from 'lodash';

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
        (page, total) => {
            setIsLoading(true);
            // Comparisons
            let comparisonsService;
            if (sort === 'combined') {
                // in case of combined sort we list 50% featured and 50% newest items (new not featured)
                const newComparisonsService = getComparisonsByResearchFieldId({
                    id: researchFieldId,
                    page: page,
                    items: Math.round(pageSize / 2),
                    sortBy: 'created_at',
                    desc: true,
                    subfields: includeSubFields,
                    featured: false,
                    unlisted: false
                });
                const featuredComparisonsService = getComparisonsByResearchFieldId({
                    id: researchFieldId,
                    page: page,
                    items: Math.round(pageSize / 2),
                    sortBy: 'created_at',
                    desc: true,
                    subfields: includeSubFields,
                    featured: true,
                    unlisted: false
                });
                comparisonsService = Promise.all([newComparisonsService, featuredComparisonsService]).then(
                    ([newComparisons, featuredComparisons]) => {
                        const combinedComparisons = mergeAlternate(newComparisons.content, featuredComparisons.content);
                        return {
                            content: combinedComparisons,
                            totalElements: page === 0 ? newComparisons.totalElements + featuredComparisons.totalElements : total,
                            last: newComparisons.last && featuredComparisons.last
                        };
                    }
                );
            } else {
                if (researchFieldId === MISC.RESEARCH_FIELD_MAIN) {
                    comparisonsService = getResourcesByClass({
                        id: sort === 'featured' ? CLASSES.FEATURED_COMPARISON_HOME_PAGE : CLASSES.COMPARISON,
                        sortBy: 'created_at',
                        desc: true,
                        items: pageSize,
                        featured: sort === 'featured' ? true : null,
                        unlisted: false
                    });
                } else {
                    comparisonsService = getComparisonsByResearchFieldId({
                        id: researchFieldId,
                        page: page,
                        items: pageSize,
                        sortBy: 'created_at',
                        desc: true,
                        subfields: includeSubFields,
                        featured: sort === 'featured' ? true : null,
                        unlisted: sort === 'unlisted' ? true : false
                    });
                }
            }

            comparisonsService
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

                            setComparisons(prevResources => {
                                const newItems = groupVersionsOfComparisons([
                                    ...flatten([...prevResources.map(c => c.versions), ...prevResources]),
                                    ...papers
                                ]);
                                return flatten([...prevResources, newItems.filter(t => !prevResources.map(p => p.id).includes(t.id))]);
                            });

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
    }, [researchFieldId, sort, includeSubFields]);

    useEffect(() => {
        loadData(0);
    }, [loadData]);

    const handleLoadMore = () => {
        if (!isLoading) {
            loadData(page, totalElements);
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
