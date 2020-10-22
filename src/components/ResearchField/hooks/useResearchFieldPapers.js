import { useState, useEffect, useCallback } from 'react';
import { getStatementsByObjectAndPredicate, getStatementsBySubjects } from 'services/backend/statements';
import { useParams } from 'react-router-dom';
import { getPaperData } from 'utils';
import { find } from 'lodash';
import { CLASSES, PREDICATES } from 'constants/graphSettings';

function useResearchFieldPapers() {
    const pageSize = 10;
    const { researchFieldId } = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const [page, setPage] = useState(1);
    const [papers, setPapers] = useState([]);

    const loadPapers = useCallback(
        page => {
            setIsLoading(true);

            // Get the statements that contains the research field as an object
            getStatementsByObjectAndPredicate({
                objectId: researchFieldId,
                predicateId: PREDICATES.HAS_RESEARCH_FIELD,
                page: page,
                items: pageSize,
                sortBy: 'created_at',
                desc: true
            }).then(result => {
                // Papers
                if (result.length > 0) {
                    // const parentResearchField = result.find(statement => statement.predicate.id === PREDICATES.HAS_SUB_RESEARCH_FIELD);
                    // Fetch the data of each paper
                    getStatementsBySubjects({
                        ids: result
                            .filter(paper => paper.subject.classes.includes(CLASSES.PAPER))
                            .filter(statement => statement.predicate.id === PREDICATES.HAS_RESEARCH_FIELD)
                            .map(p => p.subject.id)
                    })
                        .then(papersStatements => {
                            const papers = papersStatements.map(paperStatements => {
                                const paperSubject = find(result.map(p => p.subject), { id: paperStatements.id });
                                return getPaperData(
                                    paperStatements.id,
                                    paperSubject && paperSubject.label ? paperSubject.label : 'No Title',
                                    paperStatements.statements
                                );
                            });

                            setPapers(prevResources => [...prevResources, ...papers]);
                            setIsLoading(false);
                            // use result instead of results because filtering by contribution class might reduce the number of items
                            setHasNextPage(papers.length < pageSize || papers.length === 0 ? false : true);
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
        setPapers([]);
        setHasNextPage(false);
        setIsLastPageReached(false);
        setPage(1);
    }, [researchFieldId]);

    useEffect(() => {
        loadPapers(1);
    }, [loadPapers]);

    const handleLoadMore = () => {
        if (!isLoading) {
            loadPapers(page);
        }
    };

    return [papers, isLoading, hasNextPage, isLastPageReached, handleLoadMore];
}
export default useResearchFieldPapers;
