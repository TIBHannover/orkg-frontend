import { useState, useEffect, useCallback } from 'react';
import { getStatementsBySubjects } from 'services/backend/statements';
import { find } from 'lodash';
import { CLASSES } from 'constants/graphSettings';
import { getPaperData } from 'utils';
import { getResourcesByClass } from 'services/backend/resources';
import { toast } from 'react-toastify';

function useUsage({ id }) {
    const [isNextPageLoading, setIsNextPageLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [page, setPage] = useState(0);
    const [papers, setPapers] = useState([]);
    const [totalElements, setTotalElements] = useState(0);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const pageSize = 10;

    const loadMoreWorks = useCallback(
        p => {
            setIsNextPageLoading(true);
            getResourcesByClass({
                id: CLASSES.PAPER,
                page: p,
                items: pageSize,
                sortBy: 'created_at',
                desc: true,
            })
                .then(result => {
                    // Resources
                    if (result.totalElements === 0) {
                        setIsNextPageLoading(false);
                        setHasNextPage(false);
                        return;
                    }
                    // Fetch the data of each resource
                    getStatementsBySubjects({
                        ids: result.content.map(r => r.id),
                    })
                        .then(resourcesStatements => {
                            const new_resources = resourcesStatements.map(resourceStatements => {
                                const resourceSubject = find(result.content, { id: resourceStatements.id });
                                return getPaperData(resourceSubject, resourceStatements.statements);
                            });
                            setPapers(prevResources => [...prevResources, ...new_resources]);
                            setIsNextPageLoading(false);
                            setHasNextPage(!result.last);
                            setPage(p + 1);
                        })
                        .catch(error => {
                            setIsNextPageLoading(false);
                            setHasNextPage(false);
                            console.log(error);
                        });
                })
                .catch(error => {
                    console.log(error);
                    toast.error('Something went wrong while loading search results.');
                });
        },
        [id],
    );
    // reset resources when the id has changed
    useEffect(() => {
        setPapers([]);
        setHasNextPage(false);
        setIsLastPageReached(false);
        setPage(0);
        setTotalElements(0);
    }, []);

    useEffect(() => {
        loadMoreWorks(0);
    }, [loadMoreWorks]);

    const handleLoadMore = useCallback(() => {
        if (!isNextPageLoading) {
            loadMoreWorks(page);
        }
    }, [isNextPageLoading, loadMoreWorks, page]);

    return { isNextPageLoading, hasNextPage, papers, totalElements, isLastPageReached, handleLoadMore };
}
export default useUsage;
