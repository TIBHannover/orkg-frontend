import CardFactory from 'components/Cards/CardFactory/CardFactory';
import ContentTypeListHeader from 'components/ContentTypeList/ContentTypeListHeader';
import Filters from 'components/Filters/Filters';
import usePaginate from 'components/PaginatedContent/hooks/usePaginate';
import ListPaginatedContent from 'components/PaginatedContent/ListPaginatedContent';
import Tabs from 'components/Tabs/Tabs';
import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import { CLASSES } from 'constants/graphSettings';
import { ALL_CONTENT_TYPES_ID } from 'constants/misc';
import { parseAsJson, useQueryState } from 'nuqs';
import { toast } from 'react-toastify';
import { contentTypesUrl, getContentTypes } from 'services/backend/contentTypes';
import { FilterConfig, Item, VisibilityOptions } from 'services/backend/types';

export const OBSERVATORY_CONTENT_TABS = [
    { id: ALL_CONTENT_TYPES_ID, label: 'All' },
    { id: CLASSES.COMPARISON, label: 'Comparisons' },
    { id: CLASSES.PAPER, label: 'Papers' },
    { id: CLASSES.VISUALIZATION, label: 'Visualizations' },
    { id: CLASSES.SMART_REVIEW_PUBLISHED, label: 'Reviews' },
    { id: CLASSES.LITERATURE_LIST_PUBLISHED, label: 'Lists' },
    { id: CLASSES.NODE_SHAPE, label: 'Templates' },
];

function ObservatoryTabsContainer({ id }: { id: string }) {
    const [contentType, setContentType] = useQueryState('contentType', { defaultValue: ALL_CONTENT_TYPES_ID });
    const [filterConfig, setFilterConfig] = useQueryState<FilterConfig[]>('filter_config', parseAsJson());
    const [sort] = useQueryState<VisibilityOptions>('sort', {
        defaultValue: VISIBILITY_FILTERS.TOP_RECENT,
        parse: (value) => value as VisibilityOptions,
    });

    // Set Default filters
    if (filterConfig && contentType !== CLASSES.PAPER) {
        toast.dismiss();
        toast.info('Filters are only available on the paper type');
        setContentType(CLASSES.PAPER, { scroll: false });
    }

    const renderListItem = (item: Item) => (
        <CardFactory showBadge={contentType === ALL_CONTENT_TYPES_ID} showCurationFlags showAddToComparison key={item.id} item={item} />
    );

    const {
        data: items,
        isLoading,
        totalElements,
        page,
        hasNextPage,
        totalPages,
        error,
        pageSize,
        setPage,
        setPageSize,
    } = usePaginate({
        fetchFunction: getContentTypes,
        fetchUrl: contentTypesUrl,
        fetchFunctionName: 'getContentTypes',
        fetchExtraParams: {
            observatory_id: id,
            visibility: sort,
            contentType,
            // ignore the label while requesting the result from the backend
            filter_config: filterConfig?.map(({ label, ...restConfig }) => restConfig),
        },
    });

    const onTabChange = (tab: string) => {
        setFilterConfig(null);
        setContentType(tab, { scroll: false, history: 'push' });
        setPage(0);
    };

    return (
        <>
            <ContentTypeListHeader isLoading={isLoading} totalElements={totalElements} />

            <Tabs
                className="box rounded mt-2"
                destroyInactiveTabPane
                onChange={onTabChange}
                activeKey={contentType}
                items={OBSERVATORY_CONTENT_TABS.map((tab) => ({
                    label: tab.label,
                    key: tab.id,
                    children: (
                        <>
                            {contentType === CLASSES.PAPER && <Filters id={id} />}
                            <ListPaginatedContent<Item>
                                renderListItem={renderListItem}
                                pageSize={pageSize}
                                label="observatory"
                                isLoading={isLoading}
                                items={items ?? []}
                                hasNextPage={hasNextPage}
                                page={page}
                                setPage={setPage}
                                setPageSize={setPageSize}
                                totalElements={totalElements}
                                error={error}
                                totalPages={totalPages}
                                boxShadow={false}
                            />
                        </>
                    ),
                }))}
            />
        </>
    );
}

export default ObservatoryTabsContainer;
