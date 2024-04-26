import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import { CLASSES, RESOURCES } from 'constants/graphSettings';
import { find } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { getPapersByResearchFieldId } from 'services/backend/researchFields';
import { getResources } from 'services/backend/resources';
import { getStatementsBySubjects } from 'services/backend/statements';
import { addAuthorsToStatementBundle, getPaperData, mergeAlternate } from 'utils';

function useResearchFieldPapers({ researchFieldId, initialSort, initialIncludeSubFields, pageSize = 10 }) {
    const [isLoading, setIsLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const [page, setPage] = useState(0);
    const [papers, setPapers] = useState([]);
    const [sort, setSort] = useState(initialSort);
    const [totalElements, setTotalElements] = useState(0);
    const [includeSubFields, setIncludeSubFields] = useState(initialIncludeSubFields);

    const loadData = useCallback(
        (_page, total) => {
            setIsLoading(true);
            // Papers
            let papersService;
            if (sort === 'combined') {
                // in case of combined sort we list 50% featured and 50% not featured items
                const noFeaturedPapersService = getPapersByResearchFieldId({
                    id: researchFieldId,
                    page: _page,
                    size: Math.round(pageSize / 2),
                    sortBy: 'created_at',
                    desc: true,
                    subfields: includeSubFields,
                    visibility: VISIBILITY_FILTERS.NON_FEATURED,
                });
                const featuredPapersService = getPapersByResearchFieldId({
                    id: researchFieldId,
                    page: _page,
                    size: Math.round(pageSize / 2),
                    sortBy: 'created_at',
                    desc: true,
                    subfields: includeSubFields,
                    visibility: VISIBILITY_FILTERS.FEATURED,
                });
                papersService = Promise.all([noFeaturedPapersService, featuredPapersService]).then(([noFeaturedPapers, featuredPapers]) => {
                    // merge two arrays and alternate values
                    const combinedPapers = mergeAlternate(noFeaturedPapers.content, featuredPapers.content);
                    return {
                        content: combinedPapers,
                        totalElements: _page === 0 ? noFeaturedPapers.totalElements + featuredPapers.totalElements : total,
                        last: noFeaturedPapers.last && featuredPapers.last,
                    };
                });
            } else if (researchFieldId === RESOURCES.RESEARCH_FIELD_MAIN) {
                papersService = getResources({
                    include: [sort === 'featured' ? CLASSES.FEATURED_PAPER : CLASSES.PAPER],
                    sortBy: 'created_at',
                    desc: true,
                    size: pageSize,
                    visibility: sort,
                });
            } else {
                papersService = getPapersByResearchFieldId({
                    id: researchFieldId,
                    page: _page,
                    size: pageSize,
                    sortBy: 'created_at',
                    desc: true,
                    subfields: includeSubFields,
                    visibility: sort,
                });
            }

            papersService
                .then((result) => {
                    // Fetch the data of each paper
                    getStatementsBySubjects({
                        ids: result.content.map((p) => p.id),
                    })
                        .then((statements) => addAuthorsToStatementBundle(statements))
                        .then((papersStatements) => {
                            const _papers = papersStatements.map((paperStatements) => {
                                const paperSubject = find(result.content, {
                                    id: paperStatements.id,
                                });
                                return getPaperData(paperSubject, paperStatements.statements);
                            });

                            setPapers((prevResources) => [...prevResources, ..._papers]);
                            setIsLoading(false);
                            setHasNextPage(!result.last);
                            setIsLastPageReached(result.last);
                            setTotalElements(result.totalElements);
                            setPage(_page + 1);
                        })
                        .catch(() => {
                            setIsLoading(false);
                            setHasNextPage(false);
                            setIsLastPageReached(_page > 1);
                        });
                })
                .catch(() => {
                    setIsLoading(false);
                    setHasNextPage(false);
                    setIsLastPageReached(_page > 1);
                });
        },
        [sort, researchFieldId, pageSize, includeSubFields],
    );

    // reset resources when the researchFieldId has changed
    useEffect(() => {
        setPapers([]);
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
        papers,
        isLoading,
        hasNextPage,
        isLastPageReached,
        sort,
        includeSubFields,
        totalElements,
        page,
        handleLoadMore,
        setIncludeSubFields,
        setSort,
    };
}
export default useResearchFieldPapers;
