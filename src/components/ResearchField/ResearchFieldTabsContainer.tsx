import { useQueryState } from 'nuqs';

import CardFactory from '@/components/Cards/CardFactory/CardFactory';
import ContentTypeListHeader from '@/components/ContentTypeList/ContentTypeListHeader';
import usePaginate from '@/components/PaginatedContent/hooks/usePaginate';
import ListPaginatedContent from '@/components/PaginatedContent/ListPaginatedContent';
import TabLabel from '@/components/Tabs/TabLabel';
import Tabs from '@/components/Tabs/Tabs';
import { VISIBILITY_FILTERS } from '@/constants/contentTypes';
import { CLASSES } from '@/constants/graphSettings';
import { ALL_CONTENT_TYPES_ID } from '@/constants/misc';
import { contentTypesUrl, getContentTypes } from '@/services/backend/contentTypes';
import { Item, VisibilityOptions } from '@/services/backend/types';

export const RESEARCH_FIELD_CONTENT_TABS = [
    { id: CLASSES.COMPARISON, label: 'Comparisons', params: { published: true } },
    { id: CLASSES.PAPER, label: 'Papers', params: { published: undefined } },
    { id: CLASSES.VISUALIZATION, label: 'Visualizations', params: { published: undefined } },
    { id: CLASSES.SMART_REVIEW_PUBLISHED, label: 'Reviews', params: { published: true } },
    { id: CLASSES.LITERATURE_LIST_PUBLISHED, label: 'Lists', params: { published: true } },
];

function ResearchFieldTabsContainer({ id, boxShadow = true }: { id: string; boxShadow?: boolean }) {
    const [contentType, setContentType] = useQueryState('contentType', { defaultValue: CLASSES.COMPARISON });
    const [sort] = useQueryState<VisibilityOptions>('sort', {
        defaultValue: VISIBILITY_FILTERS.TOP_RECENT,
        parse: (value) => value as VisibilityOptions,
    });
    const [includeSubFields] = useQueryState('include_subfields', {
        defaultValue: true,
        parse: (value) => value === 'true',
    });

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
            research_field: id,
            include_subfields: includeSubFields,
            visibility: sort,
            contentType,
            published: true,
        },
    });

    const onTabChange = (tab: string) => {
        setContentType(tab, { scroll: false, history: 'push' });
        setPage(0);
    };

    return (
        <>
            <ContentTypeListHeader isLoading={isLoading} totalElements={totalElements} showSubFieldsFilter />

            <Tabs
                className={`rounded mt-2 ${boxShadow ? 'box' : ''}`}
                destroyOnHidden
                onChange={onTabChange}
                activeKey={contentType}
                items={RESEARCH_FIELD_CONTENT_TABS.map((tab) => ({
                    label: (
                        <TabLabel
                            label={tab.label}
                            classId={tab.id}
                            showCount
                            countParams={{
                                researchFieldId: id,
                                includeSubfields: includeSubFields,
                                visibility: sort,
                                published: tab.params.published,
                            }}
                        />
                    ),
                    key: tab.id,
                    children: (
                        <ListPaginatedContent<Item>
                            renderListItem={renderListItem}
                            pageSize={pageSize}
                            label="Research Field"
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
                    ),
                }))}
            />
        </>
    );
}

export default ResearchFieldTabsContainer;
