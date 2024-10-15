import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import { ALL_CONTENT_TYPES_ID } from 'constants/misc';
import { useQueryState } from 'nuqs';
import { contentTypesUrl, GetContentParams, getContentTypes } from 'services/backend/contentTypes';
import { VisibilityOptions } from 'services/backend/types';
import useSWRInfinite from 'swr/infinite';

function useUserProfileContent({ userId, pageSize = 30 }: { userId: string; pageSize?: number }) {
    const [contentType] = useQueryState('contentType', { defaultValue: ALL_CONTENT_TYPES_ID });

    const [sort] = useQueryState<VisibilityOptions>('sort', {
        defaultValue: VISIBILITY_FILTERS.TOP_RECENT,
        parse: (value) => value as VisibilityOptions,
    });

    const getKey = (pageIndex: number): GetContentParams & { contentType: string } => ({
        created_by: userId,
        page: pageIndex,
        size: pageSize,
        sortBy: [{ property: 'created_at', direction: 'desc' }],
        visibility: sort,
        contentType,
        published: true,
    });

    const { data, isLoading, isValidating, size, setSize, mutate } = useSWRInfinite(
        (pageIndex) => [getKey(pageIndex), contentTypesUrl, 'getContentTypes'],
        ([params]) => getContentTypes(params),
    );

    const totalElements = data?.[0]?.totalElements;
    const isEmpty = totalElements === 0;
    const isLastPageReached = isEmpty || (data && data[data.length - 1])?.last;
    const hasNextPage = !isLastPageReached;

    const handleLoadMore = () => setSize(size + 1);

    return {
        items: data,
        isLoading: isLoading || isValidating,
        hasNextPage,
        isLastPageReached,
        totalElements,
        page: size,
        handleLoadMore,
        mutate,
    };
}

export default useUserProfileContent;
