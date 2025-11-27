import { parseAsJson, useQueryState } from 'nuqs';
import { toast } from 'react-toastify';

import CardFactory from '@/components/Cards/CardFactory/CardFactory';
import ContentTypeListHeader from '@/components/ContentTypeList/ContentTypeListHeader';
import Filters from '@/components/Filters/Filters';
import { schemaFilterConfig } from '@/components/Filters/hooks/useFilterConfig';
import usePaginate from '@/components/PaginatedContent/hooks/usePaginate';
import ListPaginatedContent from '@/components/PaginatedContent/ListPaginatedContent';
import TabLabel from '@/components/Tabs/TabLabel';
import Tabs from '@/components/Tabs/Tabs';
import { VISIBILITY_FILTERS } from '@/constants/contentTypes';
import { CLASSES } from '@/constants/graphSettings';
import { ALL_CONTENT_TYPES_ID } from '@/constants/misc';
import { contentTypesUrl, getContentTypes } from '@/services/backend/contentTypes';
import { FilterConfig, Item, VisibilityOptions } from '@/services/backend/types';

export const OBSERVATORY_CONTENT_TABS = [
    {
        id: ALL_CONTENT_TYPES_ID,
        label: 'All',
        params: { published: undefined },
        description: 'All content types except statements and statements types',
    },
    { id: CLASSES.COMPARISON, label: 'Comparisons', params: { published: true } },
    { id: CLASSES.PAPER, label: 'Papers', params: { published: undefined } },
    { id: CLASSES.VISUALIZATION, label: 'Visualizations', params: { published: undefined } },
    { id: CLASSES.SMART_REVIEW_PUBLISHED, label: 'Reviews', params: { published: true } },
    { id: CLASSES.LITERATURE_LIST_PUBLISHED, label: 'Lists', params: { published: true } },
    { id: CLASSES.NODE_SHAPE, label: 'Templates', params: { published: undefined } },
    { id: CLASSES.ROSETTA_STONE_STATEMENT, label: 'Statements', params: { published: undefined } },
    { id: CLASSES.ROSETTA_NODE_SHAPE, label: 'Statement templates', params: { published: undefined } },
];

function ObservatoryTabsContainer({ id }: { id: string }) {
    const [contentType, setContentType] = useQueryState('contentType', { defaultValue: ALL_CONTENT_TYPES_ID });
    const [filterConfig, setFilterConfig] = useQueryState<FilterConfig[]>(
        'filter_config',
        parseAsJson<FilterConfig[]>(schemaFilterConfig.parse).withDefault([]),
    );
    const [sort] = useQueryState<VisibilityOptions>('sort', {
        defaultValue: VISIBILITY_FILTERS.TOP_RECENT,
        parse: (value) => value as VisibilityOptions,
    });

    // Set Default filters
    if (filterConfig && filterConfig.length > 0 && contentType !== CLASSES.PAPER) {
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
            published: true,
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
                destroyOnHidden
                onChange={onTabChange}
                activeKey={contentType}
                items={OBSERVATORY_CONTENT_TABS.map((tab) => ({
                    label: (
                        <TabLabel
                            label={tab.label}
                            classId={tab.id}
                            description={tab.description}
                            showCount
                            countParams={{ visibility: sort, observatoryId: id, published: tab.params?.published }}
                        />
                    ),
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
