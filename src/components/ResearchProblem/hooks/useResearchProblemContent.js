import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import ROUTES from 'constants/routes.js';
import { find, flatten } from 'lodash';
import { reverse } from 'named-urls';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getContentByResearchProblemIdAndClasses } from 'services/backend/problems';
import { getStatementsBySubjects } from 'services/backend/statements';
import { addAuthorsToStatementBundle, getDataBasedOnType, groupVersionsOfComparisons, mergeAlternate, reverseWithSlug } from 'utils';

function useResearchProblemContent({
    researchProblemId,
    slug,
    initialSort,
    initialClassFilterOptions,
    initClassesFilter,
    pageSize = 30,
    updateURL = false,
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
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
                const noFeaturedContentService = getContentByResearchProblemIdAndClasses({
                    id: researchProblemId,
                    page,
                    items: Math.round(pageSize / 2),
                    sortBy: 'created_at',
                    desc: true,
                    visibility: VISIBILITY_FILTERS.NON_FEATURED,
                    classes: classesFilter.map(c => c.id),
                });
                const featuredContentService = getContentByResearchProblemIdAndClasses({
                    id: researchProblemId,
                    page,
                    items: Math.round(pageSize / 2),
                    sortBy: 'created_at',
                    desc: true,
                    visibility: VISIBILITY_FILTERS.FEATURED,
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
                contentService = getContentByResearchProblemIdAndClasses({
                    id: researchProblemId,
                    page,
                    items: pageSize,
                    sortBy: 'created_at',
                    desc: true,
                    visibility: sort,
                    classes: classesFilter.map(c => c.id),
                });
            }

            contentService
                .then(result => {
                    // Fetch the data of each content
                    getStatementsBySubjects({
                        ids: result.content.map(p => p.id),
                    })
                        .then(statements => addAuthorsToStatementBundle(statements))
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
                                    newItems = mergeAlternate(
                                        newItems.filter(i => i.featured),
                                        newItems.filter(i => !i.featured),
                                    );
                                }
                                return flatten([...prevResources, newItems.filter(t => t && !prevResources.map(p => p.id).includes(t.id))]);
                            });

                            setIsLoading(false);
                            setHasNextPage(!result.last);
                            setIsLastPageReached(result.last);
                            setTotalElements(result.totalElements);
                            setCurrentPage(page + 1);
                        })
                        .catch(() => {
                            setIsLoading(false);
                            setHasNextPage(false);
                            setIsLastPageReached(page > 1);
                        });
                })
                .catch(() => {
                    setIsLoading(false);
                    setHasNextPage(false);
                    setIsLastPageReached(page > 1);
                });
        },
        [sort, researchProblemId, pageSize, classesFilter],
    );

    // reset resources when the researchProblemId has changed
    useEffect(() => {
        setItems([]);
        setHasNextPage(false);
        setIsLastPageReached(false);
        setCurrentPage(0);
        setTotalElements(0);
    }, [researchProblemId, sort, classesFilter]);

    // update url
    useEffect(() => {
        if (updateURL) {
            navigate(
                `${
                    slug
                        ? reverseWithSlug(ROUTES.RESEARCH_PROBLEM, {
                              researchProblemId,
                              slug,
                          })
                        : reverse(ROUTES.RESEARCH_PROBLEM_NO_SLUG, {
                              researchProblemId,
                          })
                }?sort=${sort}&classesFilter=${classesFilter.map(c => c.id).join(',')}`,
                { replace: true },
            );
        }
    }, [researchProblemId, sort, classesFilter, navigate, updateURL, slug]);

    useEffect(() => {
        loadData(0);
    }, [loadData]);

    const handleLoadMore = () => {
        if (!isLoading) {
            loadData(currentPage, totalElements);
        }
    };

    return {
        items,
        isLoading,
        hasNextPage,
        isLastPageReached,
        sort,
        totalElements,
        page: currentPage,
        classFilterOptions,
        classesFilter,
        setClassesFilter,
        handleLoadMore,
        setSort,
    };
}
export default useResearchProblemContent;
