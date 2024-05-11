import useRouter from 'components/NextJsMigration/useRouter';
import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import ROUTES from 'constants/routes';
import { find, flatten } from 'lodash';
import { reverse } from 'named-urls';
import { useCallback, useEffect, useState } from 'react';
import { getContentByResearchFieldIdAndClasses } from 'services/backend/researchFields';
import { getStatementsBySubjects } from 'services/backend/statements';
import { Resource, Statement } from 'services/backend/types';
import { addAuthorsToStatementBundle, getDataBasedOnType, groupVersionsOfComparisons, mergeAlternate, reverseWithSlug } from 'utils';

export type InitialClassFilter = {
    id: string;
    label: string;
};

function useResearchFieldContent({
    researchFieldId,
    slug,
    initialSort,
    initialIncludeSubFields,
    initialClassFilterOptions,
    pageSize = 10,
    updateURL = false,
    initClassesFilter,
}: {
    researchFieldId: string;
    slug?: string;
    initialSort: string;
    initialIncludeSubFields: boolean;
    initialClassFilterOptions: InitialClassFilter[];
    pageSize?: number;
    updateURL?: boolean;
    initClassesFilter: InitialClassFilter[];
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [items, setItems] = useState<Resource[]>([]);
    const [sort, setSort] = useState(initialSort);
    const [classFilterOptions] = useState(initialClassFilterOptions);
    const [classesFilter, setClassesFilter] = useState(initClassesFilter);
    const [totalElements, setTotalElements] = useState(0);
    const [includeSubFields, setIncludeSubFields] = useState(initialIncludeSubFields);
    const router = useRouter();

    const loadData = useCallback(
        (page: number, total: number) => {
            setIsLoading(true);
            let contentService;
            if (sort === 'combined') {
                // in case of combined sort we list 50% featured and 50% unfeatured items
                const noFeaturedContentService = getContentByResearchFieldIdAndClasses({
                    id: researchFieldId,
                    page,
                    size: Math.round(pageSize / 2),
                    sortBy: 'created_at',
                    desc: true,
                    subfields: includeSubFields,
                    visibility: VISIBILITY_FILTERS.NON_FEATURED,
                    classes: classesFilter.map((c) => c.id),
                });
                const featuredContentService = getContentByResearchFieldIdAndClasses({
                    id: researchFieldId,
                    page,
                    size: Math.round(pageSize / 2),
                    sortBy: 'created_at',
                    desc: true,
                    subfields: includeSubFields,
                    visibility: VISIBILITY_FILTERS.FEATURED,
                    classes: classesFilter.map((c) => c.id),
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
                contentService = getContentByResearchFieldIdAndClasses({
                    id: researchFieldId,
                    page,
                    size: pageSize,
                    sortBy: 'created_at',
                    desc: true,
                    subfields: includeSubFields,
                    visibility: sort,
                    classes: classesFilter.map((c) => c.id),
                }).then((response) => ({ ...response, content: response.content }));
            }

            contentService
                .then((result) => {
                    // Fetch the data of each content
                    getStatementsBySubjects({
                        ids: result.content.map((p) => p.id),
                    })
                        .then((statements) => addAuthorsToStatementBundle(statements))
                        .then((contentsStatements) =>
                            Promise.all(
                                contentsStatements.map((statements: { id: string; statements: Statement[] }) => {
                                    const resourceSubject = find(result.content, {
                                        id: statements.id,
                                    });
                                    return getDataBasedOnType(resourceSubject, statements.statements);
                                }),
                            ),
                        )
                        .then((dataObjects) => {
                            setItems((prevResources: Resource[]) => {
                                let newItems: Resource[] = dataObjects;
                                newItems = groupVersionsOfComparisons([
                                    // @ts-expect-error
                                    ...flatten([...prevResources.map((c) => c.versions ?? []), ...prevResources]),
                                    ...newItems,
                                ]);
                                if (sort === 'combined') {
                                    newItems = mergeAlternate(
                                        newItems.filter((i) => i.featured),
                                        newItems.filter((i) => !i.featured),
                                    );
                                }
                                return flatten([...prevResources, newItems.filter((t) => t && !prevResources.map((p) => p.id).includes(t.id))]);
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
        [sort, researchFieldId, pageSize, includeSubFields, classesFilter],
    );

    // reset resources when the researchFieldId has changed
    useEffect(() => {
        setItems([]);
        setHasNextPage(false);
        setIsLastPageReached(false);
        setCurrentPage(0);
        setTotalElements(0);
    }, [researchFieldId, sort, includeSubFields, classesFilter]);

    // update url
    useEffect(() => {
        if (updateURL) {
            router.push(
                `${
                    slug
                        ? reverseWithSlug(ROUTES.RESEARCH_FIELD, {
                              researchFieldId,
                              slug,
                          })
                        : reverse(ROUTES.RESEARCH_FIELD_NO_SLUG, {
                              researchFieldId,
                          })
                }?sort=${sort}&includeSubFields=${includeSubFields}&classesFilter=${classesFilter.map((c) => c.id).join(',')}`,
                // @ts-expect-error
                { replace: true },
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [researchFieldId, sort, includeSubFields, classesFilter, updateURL, slug]);

    useEffect(() => {
        loadData(0, 0);
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
        includeSubFields,
        totalElements,
        page: currentPage,
        classFilterOptions,
        classesFilter,
        setClassesFilter,
        handleLoadMore,
        setIncludeSubFields,
        setSort,
    };
}
export default useResearchFieldContent;
