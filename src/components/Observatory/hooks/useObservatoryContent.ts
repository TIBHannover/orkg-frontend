import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import { CLASSES } from 'constants/graphSettings';
import { ALL_CONTENT_TYPES_ID } from 'constants/misc';
import { parseAsJson, useQueryState } from 'nuqs';
import { toast } from 'react-toastify';
import { contentTypesUrl, GetContentParams, getContentTypes } from 'services/backend/contentTypes';
import { FilterConfig, VisibilityOptions } from 'services/backend/types';
import useSWRInfinite from 'swr/infinite';

function useObservatoryContent({ observatory_id, pageSize = 30 }: { observatory_id: string; pageSize?: number }) {
    const [contentType, setContentType] = useQueryState('contentType', { defaultValue: ALL_CONTENT_TYPES_ID });

    const [sort] = useQueryState<VisibilityOptions>('sort', {
        defaultValue: VISIBILITY_FILTERS.TOP_RECENT,
        parse: (value) => value as VisibilityOptions,
    });

    const [filterConfig] = useQueryState<FilterConfig[]>('filter_config', parseAsJson());

    // Set Default filters
    if (filterConfig && contentType !== CLASSES.PAPER) {
        toast.dismiss();
        toast.info('Filters are only available on the paper type');
        setContentType(CLASSES.PAPER, { scroll: false });
    }

    const getKey = (pageIndex: number): GetContentParams & { contentType: string } => ({
        observatory_id,
        page: pageIndex,
        size: pageSize,
        sortBy: [{ property: 'created_at', direction: 'desc' }],
        visibility: sort,
        contentType,
        // ignore the label while requesting the result from the backend
        filter_config: filterConfig?.map(({ label, ...restConfig }) => restConfig),
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

export default useObservatoryContent;
