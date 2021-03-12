import { useCallback, useEffect, useState } from 'react';
import { getTopContributors } from 'services/backend/stats';
import { MISC } from 'constants/graphSettings';

function useTopContributors({ researchFieldId, pageSize = 30 }) {
    const [isLoading, setIsLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const [page, setPage] = useState(0);
    const [contributors, setContributors] = useState([]);
    const [totalElements, setTotalElements] = useState(0);

    const loadData = useCallback(
        page => {
            setIsLoading(true);
            getTopContributors({
                researchFieldId: researchFieldId === MISC.RESEARCH_FIELD_MAIN ? null : researchFieldId,
                page: page,
                items: pageSize,
                sortBy: 'contributions',
                desc: true
            })
                .then(result => {
                    setContributors(prevResources => [...prevResources, ...result.content]);
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
                });
        },
        [researchFieldId, pageSize]
    );

    useEffect(() => {
        setContributors([]);
        setHasNextPage(false);
        setIsLastPageReached(false);
        setPage(0);
        setTotalElements(0);
    }, [researchFieldId]);

    useEffect(() => {
        loadData(0);
    }, [loadData]);

    const handleLoadMore = () => {
        if (!isLoading) {
            loadData(page);
        }
    };

    return {
        contributors,
        isLoading,
        hasNextPage,
        isLastPageReached,
        totalElements,
        page,
        handleLoadMore
    };
}
export default useTopContributors;
