import { find } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { getContentByResearchFieldIdAndClasses } from 'services/backend/researchFields';
import { getStatementsBySubjects } from 'services/backend/statements';
import { getDataBasedOnType, groupVersionsOfComparisons, mergeAlternate } from 'utils';
import { useHistory } from 'react-router-dom';
import ROUTES from 'constants/routes.js';
import { reverseWithSlug } from 'utils';
import { flatten } from 'lodash';

function useResearchFieldContent({
    researchFieldId,
    slug,
    initialSort,
    initialIncludeSubFields,
    initialClassFilterOptions,
    initClassesFilter,
    pageSize = 10,
    updateURL = false
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
    const history = useHistory();

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
                    const combinedComparisons = mergeAlternate(
                        noFeaturedContent.content.map(i => ({ ...i, id: i.thingId })),
                        featuredContent.content.map(i => ({ ...i, id: i.thingId }))
                    );
                    return {
                        content: combinedComparisons,
                        totalElements: page === 0 ? noFeaturedContent.totalElements + featuredContent.totalElements : total,
                        last: noFeaturedContent.last && featuredContent.last
                    };
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
                }).then(response => ({ ...response, content: response.content?.map(i => ({ ...i, id: i.thingId })) }));
            }

            contentService
                .then(result => {
                    // Fetch the data of each content
                    getStatementsBySubjects({
                        ids: result.content.map(p => p.id)
                    })
                        .then(contentsStatements => {
                            const dataObjects = contentsStatements.map(statements => {
                                const resourceSubject = find(result.content, {
                                    id: statements.id
                                });
                                return getDataBasedOnType(
                                    { ...resourceSubject, created_at: resourceSubject.createdAt, created_by: resourceSubject.createdBy },
                                    statements.statements
                                );
                            });
                            setItems(prevResources => {
                                let newItems = groupVersionsOfComparisons([
                                    ...flatten([...prevResources.map(c => c.versions), ...prevResources]),
                                    ...dataObjects
                                ]);
                                if (sort === 'combined') {
                                    newItems = mergeAlternate(newItems.filter(i => i.featured), newItems.filter(i => !i.featured));
                                }
                                return flatten([...prevResources, newItems.filter(t => t && !prevResources.map(p => p.id).includes(t.id))]);
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

    // update url
    useEffect(() => {
        if (updateURL) {
            history.push(
                `${reverseWithSlug(ROUTES.RESEARCH_FIELD, {
                    researchFieldId: researchFieldId,
                    slug: slug
                })}?sort=${sort}&includeSubFields=${includeSubFields}&classesFilter=${classesFilter.map(c => c.id).join(',')}`
            );
        }
    }, [researchFieldId, sort, includeSubFields, classesFilter, history, updateURL, slug]);

    useEffect(() => {
        loadData(0);
    }, [loadData]);

    const handleLoadMore = () => {
        if (!isLoading) {
            loadData(page, totalElements);
        }
    };

    return {
        items: items,
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
