import useRouter from 'components/NextJsMigration/useRouter';
import useSearchParams from 'components/NextJsMigration/useSearchParams';
import { DEFAULT_CLASSES_FILTER } from 'components/Observatory/IntegratedList/IntegratedListHeader';
import { CLASSES } from 'constants/graphSettings';
import { toast } from 'react-toastify';
import { GetContentByObservatoryIdParams, getContentByObservatoryId, observatoriesUrl } from 'services/backend/observatories';
import { FilterConfig, VisibilityOptions } from 'services/backend/types';
import useSWRInfinite from 'swr/infinite';

function useObservatoryContent({ observatoryId, pageSize = 30 }: { observatoryId: string; pageSize?: number }) {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Set Default filters
    if (!searchParams.get('classesFilter')) {
        const params = new URLSearchParams(searchParams.toString());
        params.set('classesFilter', searchParams.get('filter_config') ? CLASSES.PAPER : DEFAULT_CLASSES_FILTER.map((c) => c.id).join(','));
        router.push(`?${params.toString()}`, { scroll: false });
    }
    if (searchParams.get('filter_config') && searchParams.get('classesFilter') !== CLASSES.PAPER) {
        toast.dismiss();
        toast.info('Filters are only available on the paper type');
        const params = new URLSearchParams(searchParams.toString());
        params.set('classesFilter', CLASSES.PAPER);
        router.push(`?${params.toString()}`, { scroll: false });
    }

    const getKey = (pageIndex: number): GetContentByObservatoryIdParams => ({
        id: observatoryId,
        page: pageIndex,
        size: pageSize,
        sortBy: 'created_at',
        desc: true,
        visibility: searchParams.get('sort') as VisibilityOptions,
        classes: (searchParams.get('classesFilter') || DEFAULT_CLASSES_FILTER.map((c) => c.id).join(',')).split(','),
        // ignore the label while requesting the result from the backend
        filters: JSON.parse(searchParams.get('filter_config') || '[]').map(
            ({ label, ...restConfig }: { label: string }) => restConfig,
        ) as FilterConfig[],
    });

    const { data, isLoading, isValidating, size, setSize } = useSWRInfinite(
        (pageIndex) => [getKey(pageIndex), observatoriesUrl, 'getContentByObservatoryId'],
        ([params]) => getContentByObservatoryId(params),
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
