import useSWR from 'swr';
import { useQueryState, parseAsInteger, parseAsString } from 'nuqs';
import { PaginatedResponse } from 'services/backend/types';

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

    const { totalElements, totalPages } = data || {};
    const hasNextPage = !data?.last;

    return {
        data: data?.content,
        isLoading,
        hasNextPage,
        totalElements,
        totalPages,
        page,
        pageSize,
        error,
        mutate,
        setPage,
        setPageSize,
    };
};

export default usePaginate;
