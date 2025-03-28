import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import useSWR from 'swr';

import { PaginatedResponse } from '@/services/backend/types';

type UsePaginateProps<ItemType, FetchFunctionParams> = {
    fetchFunction: (params: FetchFunctionParams) => Promise<PaginatedResponse<ItemType>>;
    fetchUrl: string;
    fetchFunctionName: string;
    fetchExtraParams: FetchFunctionParams;
    defaultPageSize?: number;
    defaultSortBy?: string;
    defaultSortDirection?: string;
    prefixParams?: string;
};

const usePaginate = <ItemType, FetchFunctionParams>({
    fetchFunction,
    fetchUrl,
    fetchFunctionName,
    fetchExtraParams,
    defaultPageSize = 30,
    defaultSortBy = 'created_at',
    defaultSortDirection = 'desc',
    prefixParams = '',
}: UsePaginateProps<ItemType, FetchFunctionParams>) => {
    const [pageSize, setPageSize] = useQueryState(`${prefixParams}pageSize`, parseAsInteger.withDefault(defaultPageSize));
    const [page, setPage] = useQueryState(`${prefixParams}page`, parseAsInteger.withDefault(0));
    const [sortBy] = useQueryState(`${prefixParams}sortBy`, parseAsString.withDefault(defaultSortBy));
    const [sortDirection] = useQueryState(`${prefixParams}sortDirection`, parseAsString.withDefault(defaultSortDirection));

    const { data, isLoading, error, mutate } = useSWR(
        [
            {
                page,
                size: pageSize,
                sortBy: [{ property: sortBy, direction: sortDirection }],
                ...fetchExtraParams,
            },
            fetchUrl,
            fetchFunctionName,
        ],
        ([params]) => fetchFunction(params),
    );

    const { page: pageObject } = data || {};

    const hasNextPage = pageObject ? pageObject.number < pageObject.total_pages - 1 : false;

    return {
        data: data?.content,
        isLoading,
        hasNextPage,
        totalElements: pageObject?.total_elements,
        totalPages: pageObject?.total_pages,
        page,
        pageSize,
        error,
        mutate,
        setPage,
        setPageSize,
    };
};

export default usePaginate;
