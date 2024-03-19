import { RESOURCES } from 'constants/graphSettings';
import { orderBy } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { getChangelogs } from 'services/backend/stats';
import { Activity } from 'services/backend/types';

function useTopChangelog({ researchFieldId, pageSize = 30 }: { researchFieldId: string; pageSize: number }) {
    const [isLoading, setIsLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const [page, setPage] = useState(0);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [totalElements, setTotalElements] = useState(0);

    const loadData = useCallback(
        (_page: number) => {
            setIsLoading(true);
            getChangelogs({
                researchFieldId: researchFieldId === RESOURCES.RESEARCH_FIELD_MAIN ? null : researchFieldId,
                page: _page,
                size: pageSize,
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
        [researchFieldId, pageSize],
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
