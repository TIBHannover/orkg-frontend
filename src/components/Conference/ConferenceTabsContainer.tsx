import { useQueryState } from 'nuqs';
import { FC } from 'react';

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

export const CONFERENCE_CONTENT_TABS = [
    { id: ALL_CONTENT_TYPES_ID, label: 'All', params: { published: undefined }, description: 'All content types' },
    { id: CLASSES.COMPARISON, label: 'Comparisons', params: { published: true } },
    { id: CLASSES.PAPER, label: 'Papers', params: { published: undefined } },
];

type ConferenceTabsContainerProps = {
    id: string;
};

const ConferenceTabsContainer: FC<ConferenceTabsContainerProps> = ({ id }) => {
    const [contentType, setContentType] = useQueryState('contentType', { defaultValue: ALL_CONTENT_TYPES_ID });

    const [sort] = useQueryState<VisibilityOptions>('sort', {
        defaultValue: VISIBILITY_FILTERS.TOP_RECENT,
        parse: (value) => value as VisibilityOptions,
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
            organizationId: id,
            visibility: sort,
            contentType,
            ...CONFERENCE_CONTENT_TABS.find((tab) => tab.id === contentType)?.params,
        },
    });

    const onTabChange = (tab: string) => {
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
                items={CONFERENCE_CONTENT_TABS.map((tab) => ({
                    label: (
                        <TabLabel
                            label={tab.label}
                            classId={tab.id}
                            description={tab.description}
                            showCount
                            countParams={{
                                visibility: sort,
                                organization_id: id,
                                ...(tab.params?.published ? { published: tab.params?.published.toString() } : {}),
                            }}
                        />
                    ),
                    key: tab.id,
                    children: (
                        <ListPaginatedContent<Item>
                            renderListItem={renderListItem}
                            pageSize={pageSize}
                            label="conference event"
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
};

export default ConferenceTabsContainer;
