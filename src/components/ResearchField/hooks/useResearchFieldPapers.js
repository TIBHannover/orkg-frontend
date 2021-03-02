import { find } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { getStatementsBySubjects } from 'services/backend/statements';
import { getPapersByResearchFieldId } from 'services/backend/researchFields';
import { getPaperData } from 'utils';

function useResearchFieldPapers({ researchFieldId }) {
    const pageSize = 10;
    const [isLoading, setIsLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const [page, setPage] = useState(0);
    const [papers, setPapers] = useState([]);

    const loadPapers = useCallback(
        page => {
            setIsLoading(true);
            getPapersByResearchFieldId({
                id: researchFieldId,
                page: page,
                items: pageSize,
                sortBy: 'created_at',
                desc: true
            }).then(result => {
                // Papers
                // Fetch the data of each paper
                getStatementsBySubjects({
                    ids: result.content.map(p => p.resourceId)
                })
                    .then(papersStatements => {
                        const papers = papersStatements.map(paperStatements => {
                            const paperSubject = find(result.content.map(p => ({ ...p, created_by: p.createdBy, id: p.resourceId })), {
                                id: paperStatements.id
                            });
                            console.log(paperSubject);
                            console.log(papersStatements);
                            return getPaperData(paperSubject, paperStatements.statements);
                        });

                        setPapers(prevResources => [...prevResources, ...papers]);
                        setIsLoading(false);
                        setHasNextPage(!result.last);
                        setIsLastPageReached(result.last);
                        setPage(page + 1);
                    })
                    .catch(error => {
                        setIsLoading(false);
                        setHasNextPage(false);
                        setIsLastPageReached(page > 1 ? true : false);

                        console.log(error);
                    });
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
