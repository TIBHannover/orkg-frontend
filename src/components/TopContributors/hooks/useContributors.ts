import { RESOURCES } from 'constants/graphSettings';
import { useEffect, useState } from 'react';
import { getTopContributors, statsUrl } from 'services/backend/stats';
import useSWR from 'swr';

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
    const [page, setPage] = useState(0);
    const [sort, setSort] = useState(initialSort);
    const [includeSubFields, setIncludeSubFields] = useState(initialIncludeSubFields);

    useEffect(() => {
        setPage(0);
        setIncludeSubFields(initialIncludeSubFields);
        setSort(initialSort);
    }, [researchFieldId, initialIncludeSubFields, initialSort]);

    const { data, isLoading } = useSWR(
        researchFieldId
            ? [
                  {
                      researchFieldId: researchFieldId === RESOURCES.RESEARCH_FIELD_MAIN ? null : researchFieldId,
                      page,
                      size: pageSize,
                      sortBy: 'contributions',
                      desc: true,
                      days: sort === 'top' ? 30 : null,
                      subfields: includeSubFields,
                  },
                  statsUrl,
                  'getTopContributors',
              ]
            : null,
        ([params]) => getTopContributors(params),
    );

    const { page: pageObject } = data || {};
    const hasNextPage = pageObject ? pageObject.number < pageObject.total_pages - 1 : false;

    return {
        contributors: data?.content,
        isLoading,
        hasNextPage,
        totalElements: pageObject?.total_elements,
        totalPages: pageObject?.total_pages,
        page,
        pageSize,
        includeSubFields,
        sort,
        setPage,
        setSort,
        setIncludeSubFields,
    };
}
export default useContributors;
