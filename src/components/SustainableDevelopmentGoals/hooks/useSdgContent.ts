import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import { CLASSES } from 'constants/graphSettings';
import { useQueryState } from 'nuqs';
import { contentTypesUrl, GetContentParams, getContentTypes } from 'services/backend/contentTypes';
import { VisibilityOptions } from 'services/backend/types';
import useSWRInfinite from 'swr/infinite';

function useSdgContent({ sdgId, pageSize = 30 }: { sdgId: string; pageSize?: number }) {
    const [contentType] = useQueryState('contentType', { defaultValue: CLASSES.COMPARISON });

    const [sort] = useQueryState<VisibilityOptions>('sort', {
        defaultValue: VISIBILITY_FILTERS.TOP_RECENT,
        parse: (value) => value as VisibilityOptions,
    });

    const getKey = (pageIndex: number): GetContentParams & { contentType: string } => ({
        sdg: sdgId,
        page: pageIndex,
        size: pageSize,
        sortBy: [{ property: 'created_at', direction: 'desc' }],
        visibility: sort,
        contentType,
    });

    const { data, isLoading, isValidating, size, setSize } = useSWRInfinite(
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
    };
}

export default useSdgContent;
