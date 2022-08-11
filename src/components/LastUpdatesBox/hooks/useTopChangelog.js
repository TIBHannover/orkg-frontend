import { useCallback, useEffect, useState } from 'react';
import { getChangelogs } from 'services/backend/stats';
import { orderBy } from 'lodash';
import { RESOURCES } from 'constants/graphSettings';

function useTopChangelog({ researchFieldId, pageSize = 30, sortBy = 'createdAt', desc = true }) {
    const [isLoading, setIsLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const [page, setPage] = useState(0);
    const [activities, setActivities] = useState([]);
    const [totalElements, setTotalElements] = useState(0);

    const loadData = useCallback(
        page => {
            setIsLoading(true);
            getChangelogs({
                researchFieldId: researchFieldId === RESOURCES.RESEARCH_FIELD_MAIN ? null : researchFieldId,
                page,
                items: pageSize,
                sortBy: researchFieldId === RESOURCES.RESEARCH_FIELD_MAIN ? null : sortBy,
                desc,
            })
                .then(result => {
                    setActivities(prevResources => orderBy([...prevResources, ...(result.content || [])], ['created_at'], ['desc']));
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
        },
        [researchFieldId, pageSize, sortBy, desc],
    );

    // reset resources when the researchFieldId has changed
    useEffect(() => {
        setActivities([]);
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
        activities,
        isLoading,
        hasNextPage,
        isLastPageReached,
        totalElements,
        page,
        handleLoadMore,
    };
}
export default useTopChangelog;
