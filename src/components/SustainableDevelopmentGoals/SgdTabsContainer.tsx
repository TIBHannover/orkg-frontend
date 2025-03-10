import CardFactory from 'components/Cards/CardFactory/CardFactory';
import ContentTypeListHeader from 'components/ContentTypeList/ContentTypeListHeader';
import usePaginate from 'components/PaginatedContent/hooks/usePaginate';
import ListPaginatedContent from 'components/PaginatedContent/ListPaginatedContent';
import TabLabel from 'components/Tabs/TabLabel';
import Tabs from 'components/Tabs/Tabs';
import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import { CLASSES } from 'constants/graphSettings';
import { ALL_CONTENT_TYPES_ID } from 'constants/misc';
import { useQueryState } from 'nuqs';
import { FC } from 'react';
import { Container } from 'reactstrap';
import { contentTypesUrl, getContentTypes } from 'services/backend/contentTypes';
import { Item, VisibilityOptions } from 'services/backend/types';

type SgdTabsContainerProps = {
    sdgId: string;
};

export const SDG_CONTENT_TABS = [
    { id: CLASSES.COMPARISON, label: 'Comparisons', params: { published: true } },
    { id: CLASSES.PAPER, label: 'Papers', params: { published: undefined } },
    // visualizations can't be associated with sdg
    // { id: CLASSES.VISUALIZATION, label: 'Visualizations' },
    { id: CLASSES.SMART_REVIEW_PUBLISHED, label: 'Reviews', params: { published: true } },
    { id: CLASSES.LITERATURE_LIST_PUBLISHED, label: 'Lists', params: { published: true } },
];

const SgdTabsContainer: FC<SgdTabsContainerProps> = ({ sdgId }) => {
    const [contentType, setContentType] = useQueryState('contentType', { defaultValue: CLASSES.COMPARISON });

    const renderListItem = (item: Item) => (
        <CardFactory showBadge={contentType === ALL_CONTENT_TYPES_ID} showCurationFlags showAddToComparison key={item.id} item={item} />
    );

    const [sort] = useQueryState<VisibilityOptions>('sort', {
        defaultValue: VISIBILITY_FILTERS.TOP_RECENT,
        parse: (value) => value as VisibilityOptions,
    });

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
            sdg: sdgId,
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
        <Container className="mt-4 p-0">
            <ContentTypeListHeader isLoading={isLoading} totalElements={totalElements} />

            <Tabs
                className="box rounded"
                destroyInactiveTabPane
                onChange={onTabChange}
                activeKey={contentType}
                items={SDG_CONTENT_TABS.map((tab) => ({
                    label: <TabLabel label={tab.label} classId={tab.id} showCount countParams={{ sdgId, published: tab.params?.published }} />,
                    key: tab.id,
                    children: (
                        <ListPaginatedContent<Item>
                            renderListItem={renderListItem}
                            pageSize={pageSize}
                            label="SDG"
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
        </Container>
    );
};

export default SgdTabsContainer;
