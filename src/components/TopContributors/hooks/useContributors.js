import { useCallback, useEffect, useState } from 'react';
import { getTopContributors } from 'services/backend/stats';
import { orderBy } from 'lodash';
import { getContributorsByResearchFieldId } from 'services/backend/researchFields';
import { MISC } from 'constants/graphSettings';

function useContributors({ researchFieldId, pageSize = 30, initialSort = 'top', initialIncludeSubFields = true }) {
    const [isLoading, setIsLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const [page, setPage] = useState(0);
    const [sort, setSort] = useState(initialSort);
    const [contributors, setContributors] = useState([]);
    const [totalElements, setTotalElements] = useState(0);
    const [includeSubFields, setIncludeSubFields] = useState(initialIncludeSubFields);

    const loadData = useCallback(
        page => {
            setIsLoading(true);
            let contributorsCall;
            if (sort === 'top') {
                contributorsCall = getTopContributors({
                    researchFieldId: researchFieldId === MISC.RESEARCH_FIELD_MAIN ? null : researchFieldId,
                    page: page,
                    items: pageSize,
                    sortBy: 'contributions',
                    desc: true
                });
            } else {
                contributorsCall = getContributorsByResearchFieldId({
                    id: researchFieldId,
                    page: page,
                    items: pageSize,
                    subfields: includeSubFields
                }).then(result => {
                    result.content = result.content.map(c => ({
                        profile: c,
                        contributions: null
                    }));
                    return result;
                });
            }

            contributorsCall
                .then(result => {
                    setContributors(prevResources => orderBy([...prevResources, ...(result.content || [])], ['contributions'], ['desc']));
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
        [includeSubFields, researchFieldId, sort, pageSize]
    );

    useEffect(() => {
        setContributors([]);
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
        setSort
    };
}
export default useContributors;
