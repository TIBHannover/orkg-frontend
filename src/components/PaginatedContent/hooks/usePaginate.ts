import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryState } from 'nuqs';
import useSWR from 'swr';

import { Pagination, SortDirectionOptions } from '@/services/backend/types';

type UsePaginateProps<ItemType, FetchFunctionParams> = {
    fetchFunction: (params: FetchFunctionParams) => Promise<Pagination<ItemType>>;
    fetchUrl: string;
    fetchFunctionName: string;
    // NoInfer: the params type comes from fetchFunction alone, so a key the service does not
    // declare (e.g. a snake_case leftover like organization_id) is an excess-property error
    // instead of silently being dropped by the generated client
    fetchExtraParams: NoInfer<Partial<FetchFunctionParams>>;
    defaultPageSize?: number;
    defaultSortBy?: string;
    defaultSortDirection?: SortDirectionOptions;
    prefixParams?: string;
    isReadyToLoad?: boolean;
};

const usePaginate = <ItemType, FetchFunctionParams>({
    fetchFunction,
    fetchUrl,
    fetchFunctionName,
    fetchExtraParams,
    defaultPageSize = 30,
    defaultSortBy = 'createdAt',
    defaultSortDirection = 'desc' as SortDirectionOptions,
    prefixParams = '',
    isReadyToLoad = true,
}: UsePaginateProps<ItemType, FetchFunctionParams>) => {
    const [pageSize, setPageSize] = useQueryState(`${prefixParams}pageSize`, parseAsInteger.withDefault(defaultPageSize));
    const [page, setPage] = useQueryState(`${prefixParams}page`, parseAsInteger.withDefault(0));
    const [sortBy] = useQueryState(`${prefixParams}sortBy`, parseAsString.withDefault(defaultSortBy));
    // the direction reaches the wire verbatim, so reject anything a URL might carry beyond asc/desc
    const [sortDirection] = useQueryState(
        `${prefixParams}sortDirection`,
        parseAsStringLiteral(['asc', 'desc'] as const).withDefault(defaultSortDirection),
    );

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
        // the hook supplies page/size/sortBy; the cast closes the Partial back into the full params type
        ([params]) => fetchFunction(params as FetchFunctionParams),
    );

    const { page: pageObject } = data || {};

    const hasNextPage = pageObject ? (pageObject.number ?? 0) < (pageObject.totalPages ?? 0) - 1 : false;

    return {
        data: data?.content,
        isLoading,
        hasNextPage,
        totalElements: pageObject?.totalElements,
        totalPages: pageObject?.totalPages,
        page,
        pageSize,
        error,
        mutate,
        setPage,
        setPageSize,
    };
};

export default usePaginate;
