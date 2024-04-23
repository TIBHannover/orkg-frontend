import { useCallback, useEffect, useState } from 'react';
import { getTopContributors } from 'services/backend/stats';
import { RESOURCES } from 'constants/graphSettings';
import { TopContributor } from 'services/backend/types';

function useContributors({
    researchFieldId,
    pageSize = 30,
    initialSort = 'top',
    initialIncludeSubFields = true,
}: {
    researchFieldId: string;
    pageSize: number;
    initialSort: string;
    initialIncludeSubFields: boolean;
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const [page, setPage] = useState(0);
    const [sort, setSort] = useState(initialSort);
    const [contributors, setContributors] = useState<TopContributor[]>([]);
    const [totalElements, setTotalElements] = useState(0);
    const [includeSubFields, setIncludeSubFields] = useState(initialIncludeSubFields);

    const loadData = useCallback(
        (_page: number) => {
            setIsLoading(true);

            const contributorsCall = getTopContributors({
                researchFieldId: researchFieldId === RESOURCES.RESEARCH_FIELD_MAIN ? null : researchFieldId,
                page: _page,
                size: pageSize,
                sortBy: 'contributions',
                desc: true,
                days: sort === 'top' ? 30 : null,
                subfields: includeSubFields,
            });

            contributorsCall
                .then((result) => {
                    setContributors((prevResources) => [...prevResources, ...(result.content || [])]);
                    setIsLoading(false);
                    setHasNextPage(!result.last);
                    setIsLastPageReached(result.last);
                    setTotalElements(result.totalElements);
                    setPage(page + 1);
                })
                .catch(() => {
                    setIsLoading(false);
                    setHasNextPage(false);
                    setIsLastPageReached(page > 1);
                });
        },
        [researchFieldId, pageSize, sort, includeSubFields],
    );

    useEffect(() => {
        setContributors([]);
        setHasNextPage(false);
        setIsLastPageReached(false);
        setPage(0);
        setTotalElements(0);
    }, [researchFieldId, includeSubFields, sort]);

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
        sort,
        includeSubFields,
        totalElements,
        page,
        handleLoadMore,
        setIncludeSubFields,
        setSort,
    };
}
export default useContributors;
