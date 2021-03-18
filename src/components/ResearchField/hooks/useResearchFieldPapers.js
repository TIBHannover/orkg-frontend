import { find } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { getStatementsBySubjects } from 'services/backend/statements';
import { getPapersByResearchFieldId } from 'services/backend/researchFields';
import { getResourcesByClass } from 'services/backend/resources';
import { getPaperData } from 'utils';
import { MISC } from 'constants/graphSettings';
import { CLASSES } from 'constants/graphSettings';

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
        page => {
            setIsLoading(true);
            // Papers
            let papersService;
            if (researchFieldId === MISC.RESEARCH_FIELD_MAIN) {
                papersService = getResourcesByClass({
                    id: sort === 'featured' ? CLASSES.FEATURED_PAPER : CLASSES.PAPER,
                    sortBy: 'created_at',
                    desc: sort === 'newest' || sort === 'featured' ? true : false,
                    items: pageSize
                });
            } else {
                papersService = getPapersByResearchFieldId({
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
                    // Fetch the data of each paper
                    getStatementsBySubjects({
                        ids: result.content.map(p => p.id)
                    })
                        .then(papersStatements => {
                            const papers = papersStatements.map(paperStatements => {
                                const paperSubject = find(result.content, {
                                    id: paperStatements.id
                                });
                                return getPaperData(paperSubject, paperStatements.statements);
                            });

                            setPapers(prevResources => [...prevResources, ...papers]);
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
        setPapers([]);
        setHasNextPage(false);
        setIsLastPageReached(false);
        setPage(0);
        setTotalElements(0);
        /*
        TODO: Remove the featured sort with it's not the main research field
        if (researchFieldId !== MISC.RESEARCH_FIELD_MAIN && sort === 'featured') {
            // Because filtering featured comparison based on research field is not supported
            setSort('newest');
        }
        */
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
        setSort
    };
}
export default useResearchFieldPapers;
