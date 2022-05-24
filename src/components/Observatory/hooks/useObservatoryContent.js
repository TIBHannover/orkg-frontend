import { find, flatten } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { getContentByObservatoryIdAndClasses } from 'services/backend/observatories';
import { getStatementsBySubjects } from 'services/backend/statements';
import { getDataBasedOnType, groupVersionsOfComparisons, mergeAlternate, reverseWithSlug } from 'utils';
import { useNavigate } from 'react-router-dom';
import ROUTES from 'constants/routes.js';

function useObservatoryContent({ observatoryId, initialSort, initialClassFilterOptions, initClassesFilter, pageSize = 10, updateURL = false }) {
    const [isLoading, setIsLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const [page, setPage] = useState(0);
    const [items, setItems] = useState([]);
    const [sort, setSort] = useState(initialSort);
    const [classFilterOptions] = useState(initialClassFilterOptions);
    const [classesFilter, setClassesFilter] = useState(initClassesFilter);
    const [totalElements, setTotalElements] = useState(0);
    const navigate = useNavigate();

    const loadData = useCallback(
        (page, total) => {
            setIsLoading(true);
            let contentService;
            if (sort === 'combined') {
                // in case of combined sort we list 50% featured and 50% unfeatured items
                const noFeaturedContentService = getContentByObservatoryIdAndClasses({
                    id: observatoryId,
                    page,
                    items: Math.round(pageSize / 2),
                    sortBy: 'created_at',
                    desc: true,
                    featured: false,
                    unlisted: false,
                    classes: classesFilter.map(c => c.id),
                });
                const featuredContentService = getContentByObservatoryIdAndClasses({
                    id: observatoryId,
                    page,
                    items: Math.round(pageSize / 2),
                    sortBy: 'created_at',
                    desc: true,
                    featured: true,
                    unlisted: false,
                    classes: classesFilter.map(c => c.id),
                });
                contentService = Promise.all([noFeaturedContentService, featuredContentService]).then(([noFeaturedContent, featuredContent]) => {
                    const combinedComparisons = mergeAlternate(noFeaturedContent.content, featuredContent.content);
                    return {
                        content: combinedComparisons,
                        totalElements: page === 0 ? noFeaturedContent.totalElements + featuredContent.totalElements : total,
                        last: noFeaturedContent.last && featuredContent.last,
                    };
                });
            } else {
                contentService = getContentByObservatoryIdAndClasses({
                    id: observatoryId,
                    page,
                    items: pageSize,
                    sortBy: 'created_at',
                    desc: true,
                    featured: sort === 'featured' ? true : null,
                    unlisted: sort === 'unlisted',
                    classes: classesFilter.map(c => c.id),
                }).then(response => ({ ...response, content: response.content }));
            }

            contentService
                .then(result => {
                    // Fetch the data of each content
                    getStatementsBySubjects({
                        ids: result.content.map(p => p.id),
                    })
                        .then(contentsStatements => {
                            const dataObjects = contentsStatements.map(statements => {
                                const resourceSubject = find(result.content, {
                                    id: statements.id,
                                });
                                return getDataBasedOnType(resourceSubject, statements.statements);
                            });
                            setItems(prevResources => {
                                let newItems = groupVersionsOfComparisons([
                                    ...flatten([...prevResources.map(c => c.versions ?? []), ...prevResources]),
                                    ...dataObjects,
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
                            setIsLastPageReached(page > 1);

                            console.log(error);
                        });
                })
                .catch(error => {
                    setIsLoading(false);
                    setHasNextPage(false);
                    setIsLastPageReached(page > 1);

                    console.log(error);
                });
        },
        [sort, observatoryId, pageSize, classesFilter],
    );

    // reset resources when the observatoryId has changed
    useEffect(() => {
        setItems([]);
        setHasNextPage(false);
        setIsLastPageReached(false);
        setPage(0);
        setTotalElements(0);
    }, [observatoryId, sort, classesFilter]);

    // update url
    useEffect(() => {
        if (updateURL) {
            navigate(
                `${reverseWithSlug(ROUTES.OBSERVATORY, {
                    id: observatoryId,
                })}?sort=${sort}&classesFilter=${classesFilter.map(c => c.id).join(',')}`,
            );
        }
    }, [observatoryId, sort, classesFilter, navigate, updateURL]);

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
        totalElements,
        page,
        classFilterOptions,
        classesFilter,
        setClassesFilter,
        handleLoadMore,
        setSort,
    };
}
export default useObservatoryContent;
