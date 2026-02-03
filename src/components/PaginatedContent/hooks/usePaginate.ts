import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import useSWR from 'swr';

import { PaginatedResponse, Pagination } from '@/services/backend/types';

type UsePaginateProps<ItemType, FetchFunctionParams> = {
    fetchFunction: (params: FetchFunctionParams) => Promise<PaginatedResponse<ItemType> | Pagination<ItemType>>;
    fetchUrl: string;
    fetchFunctionName: string;
    fetchExtraParams: FetchFunctionParams;
    defaultPageSize?: number;
    defaultSortBy?: string;
    defaultSortDirection?: string;
    prefixParams?: string;
    isReadyToLoad?: boolean;
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
    isReadyToLoad = true,
}: UsePaginateProps<ItemType, FetchFunctionParams>) => {
    const [pageSize, setPageSize] = useQueryState(`${prefixParams}pageSize`, parseAsInteger.withDefault(defaultPageSize));
    const [page, setPage] = useQueryState(`${prefixParams}page`, parseAsInteger.withDefault(0));
    const [sortBy] = useQueryState(`${prefixParams}sortBy`, parseAsString.withDefault(defaultSortBy));
    const [sortDirection] = useQueryState(`${prefixParams}sortDirection`, parseAsString.withDefault(defaultSortDirection));

    const { data, isLoading, error, mutate } = useSWR(
        isReadyToLoad
            ? [
                  {
                      page,
                      size: pageSize,
                      sortBy: [{ property: sortBy, direction: sortDirection }],
                      ...fetchExtraParams,
                  },
                  fetchUrl,
                  fetchFunctionName,
              ]
            : null,
        ([params]) => fetchFunction(params),
    );

    const { page: pageObject } = data || {};

    // TODO: remove snake case handling after finishing services migration
    const hasNextPage = pageObject ? pageObject.number < ('total_pages' in pageObject ? pageObject.total_pages : pageObject.totalPages) - 1 : false;

    return {
        data: data?.content,
        isLoading,
        hasNextPage,
        // TODO: remove snake case handling after finishing services migration
        totalElements: pageObject ? ('total_elements' in pageObject ? pageObject.total_elements : pageObject.totalElements) : undefined,
        // TODO: remove snake case handling after finishing services migration
        totalPages: pageObject ? ('total_pages' in pageObject ? pageObject.total_pages : pageObject.totalPages) : undefined,
        page,
        pageSize,
        error,
        mutate,
        setPage,
        setPageSize,
    };
};

export default usePaginate;
