import { useState, useEffect, useCallback } from 'react';
import { getStatementsByObject, getStatementsBySubject } from 'network';
import { useParams } from 'react-router-dom';
import { getPaperData } from 'utils';

function useResearchProblemPapers() {
    const pageSize = 10;
    const { researchProblemId } = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const [page, setPage] = useState(1);
    const [papers, setPapers] = useState([]);

    const loadPapers = useCallback(
        page => {
            setIsLoading(true);

            // Get the statements that contains the research field as an object
            getStatementsByObject({
                id: researchProblemId,
                page: page,
                items: pageSize,
                sortBy: 'created_at',
                desc: true
            }).then(result => {
                // Papers
                if (result.length > 0) {
                    // Get the papers of each contribution, ensure all papers have the 'Paper' class
                    const papers = result
                        .filter(contribution => contribution.subject.classes.includes(process.env.REACT_APP_CLASSES_CONTRIBUTION))
                        .map(contribution => {
                            return getStatementsByObject({
                                id: contribution.subject.id,
                                order: 'desc'
                            }).then(papers => {
                                // Fetch the data of each paper
                                const papersData = papers
                                    .filter(paper => paper.subject.classes.includes(process.env.REACT_APP_CLASSES_PAPER))
                                    .map(paper => {
                                        return getStatementsBySubject({ id: paper.subject.id }).then(paperStatements => {
                                            return { ...paper, data: getPaperData(paper.subject.id, paper.subject.label, paperStatements) };
                                        });
                                    });
                                return Promise.all(papersData).then(results => {
                                    contribution.papers = results;
                                    return contribution.papers.length > 0 ? contribution : null;
                                });
                            });
                        });

                    Promise.all(papers).then(results => {
                        setPapers(prevResources => [...prevResources, ...results]);
                        setIsLoading(false);
                        setHasNextPage(results.length < pageSize || results.length === 0 ? false : true);
                        setIsLastPageReached(false);
                        setPage(page + 1);
                    });
                } else {
                    setIsLoading(false);
                    setHasNextPage(false);
                    setIsLastPageReached(true);
                }
            });
        },
        [researchProblemId]
    );

    // reset resources when the researchProblemId has changed
    useEffect(() => {
        setPapers([]);
        setHasNextPage(false);
        setIsLastPageReached(false);
        setPage(1);
    }, [researchProblemId]);

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
export default useResearchProblemPapers;
