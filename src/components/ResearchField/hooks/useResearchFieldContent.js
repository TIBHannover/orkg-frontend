import { CLASSES } from 'constants/graphSettings';
import { find } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { getContentByResearchFieldIdAndClasses } from 'services/backend/researchFields';
import { getResourcesByClass } from 'services/backend/resources';
import { getStatementsBySubjects } from 'services/backend/statements';
import { MISC } from 'constants/graphSettings';
import { getDataBasedOnType, groupVersionsOfComparisons, mergeAlternate } from 'utils';
import { flatten } from 'lodash';

function useResearchFieldContent({
    researchFieldId,
    initialSort,
    initialIncludeSubFields,
    initialClassFilterOptions,
    initClassesFilter,
    pageSize = 10
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const [page, setPage] = useState(0);
    const [items, setItems] = useState([]);
    const [sort, setSort] = useState(initialSort);
    const [classFilterOptions] = useState(initialClassFilterOptions);
    const [classesFilter, setClassesFilter] = useState(initClassesFilter);
    const [totalElements, setTotalElements] = useState(0);
    const [includeSubFields, setIncludeSubFields] = useState(initialIncludeSubFields);

    const loadData = useCallback(
        (page, total) => {
            setIsLoading(true);
            let contentService;
            if (sort === 'combined') {
                // in case of combined sort we list 50% featured and 50% unfeatured items
                const noFeaturedContentService = getContentByResearchFieldIdAndClasses({
                    id: researchFieldId,
                    page: page,
                    items: Math.round(pageSize / 2),
                    sortBy: 'created_at',
                    desc: true,
                    subfields: includeSubFields,
                    featured: false,
                    unlisted: false,
                    classes: classesFilter.map(c => c.id)
                });
                const featuredContentService = getContentByResearchFieldIdAndClasses({
                    id: researchFieldId,
                    page: page,
                    items: Math.round(pageSize / 2),
                    sortBy: 'created_at',
                    desc: true,
                    subfields: includeSubFields,
                    featured: true,
                    unlisted: false,
                    classes: classesFilter.map(c => c.id)
                });
                contentService = Promise.all([noFeaturedContentService, featuredContentService]).then(([noFeaturedContent, featuredContent]) => {
                    const combinedComparisons = mergeAlternate(noFeaturedContent.content, featuredContent.content);
                    return {
                        content: combinedComparisons,
                        totalElements: page === 0 ? noFeaturedContent.totalElements + featuredContent.totalElements : total,
                        last: noFeaturedContent.last && featuredContent.last
                    };
                });
            } else {
                if (researchFieldId === MISC.RESEARCH_FIELD_MAIN) {
                    contentService = getResourcesByClass({
                        id: sort === 'featured' ? CLASSES.FEATURED_COMPARISON_HOME_PAGE : CLASSES.COMPARISON,
                        sortBy: 'created_at',
                        desc: true,
                        items: pageSize,
                        featured: sort === 'featured' ? true : null,
                        unlisted: sort === 'unlisted' ? true : false
                    });
                } else {
                    contentService = getContentByResearchFieldIdAndClasses({
                        id: researchFieldId,
                        page: page,
                        items: pageSize,
                        sortBy: 'created_at',
                        desc: true,
                        subfields: includeSubFields,
                        featured: sort === 'featured' ? true : null,
                        unlisted: sort === 'unlisted' ? true : false,
                        classes: classesFilter.map(c => c.id)
                    });
                }
            }

            contentService
                .then(result => {
                    // Fetch the data of each content
                    getStatementsBySubjects({
                        ids: result.content.map(p => p.thingId)
                    })
                        .then(contentsStatements => {
                            const dataObjects = contentsStatements.map(statements => {
                                const resourceSubject = find(result.content, {
                                    thingId: statements.id
                                });
                                return getDataBasedOnType(resourceSubject, statements.statements);
                            });
                            setItems(prevResources => {
                                const newItems = groupVersionsOfComparisons([
                                    ...flatten([...prevResources.map(c => c.versions), ...prevResources]),
                                    ...dataObjects
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
        [sort, researchFieldId, pageSize, includeSubFields, classesFilter]
    );

    // reset resources when the researchFieldId has changed
    useEffect(() => {
        setItems([]);
        setHasNextPage(false);
        setIsLastPageReached(false);
        setPage(0);
        setTotalElements(0);
    }, [researchFieldId, sort, includeSubFields, classesFilter]);

    useEffect(() => {
        loadData(0);
    }, [loadData]);

    const handleLoadMore = () => {
        if (!isLoading) {
            loadData(page, totalElements);
        }
    };

    return {
        items,
        isLoading,
        hasNextPage,
        isLastPageReached,
        sort,
        includeSubFields,
        totalElements,
        page,
        classFilterOptions,
        classesFilter,
        setClassesFilter,
        handleLoadMore,
        setIncludeSubFields,
        setSort
    };
}
export default useResearchFieldContent;
