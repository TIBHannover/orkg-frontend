import CardFactory from 'components/Cards/CardFactory/CardFactory';
import ContentTypeVisibilityFilter from 'components/ContentTypeList/ContentTypeVisibilityFilter';
import usePaginate from 'components/PaginatedContent/hooks/usePaginate';
import ListPaginatedContent from 'components/PaginatedContent/ListPaginatedContent';
import TabLabel from 'components/Tabs/TabLabel';
import Tabs from 'components/Tabs/Tabs';
import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import { CLASSES, RESOURCES } from 'constants/graphSettings';
import { ALL_CONTENT_TYPES_ID } from 'constants/misc';
import ROUTES from 'constants/routes';
import Link from 'next/link';
import { useQueryState } from 'nuqs';
import { Button } from 'reactstrap';
import { contentTypesUrl, getContentTypes } from 'services/backend/contentTypes';
import { Item, VisibilityOptions } from 'services/backend/types';
import { reverseWithSlug } from 'utils';

export const HOME_CONTENT_TABS = [
    { id: CLASSES.COMPARISON, label: 'Comparisons' },
    { id: CLASSES.PAPER, label: 'Papers' },
    { id: CLASSES.VISUALIZATION, label: 'Visualizations' },
    { id: CLASSES.SMART_REVIEW_PUBLISHED, label: 'Reviews' },
    { id: CLASSES.LITERATURE_LIST_PUBLISHED, label: 'Lists' },
];

function HomeTabsContainer({ researchFieldId, researchFieldLabel }: { researchFieldId: string; researchFieldLabel: string }) {
    const [contentType, setContentType] = useQueryState('contentType', { defaultValue: CLASSES.COMPARISON });
    const [sort] = useQueryState<VisibilityOptions>('sort', {
        defaultValue: VISIBILITY_FILTERS.TOP_RECENT,
        parse: (value) => value as VisibilityOptions,
    });

    const [includeSubFields] = useQueryState('include_subfields', {
        defaultValue: true,
        parse: (value) => value === 'true',
    });

    const onTabChange = (tab: string) => {
        setContentType(tab, { scroll: false, history: 'push' });
    };

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
            research_field: researchFieldId !== RESOURCES.RESEARCH_FIELD_MAIN ? researchFieldId : undefined,
            include_subfields: researchFieldId !== RESOURCES.RESEARCH_FIELD_MAIN ? includeSubFields : undefined,
            visibility: sort,
            contentType,
            published: true,
        },
        defaultPageSize: 10,
    });

    const contentTypeLink = {
        [CLASSES.COMPARISON]: ROUTES.COMPARISONS,
        [CLASSES.PAPER]: ROUTES.PAPERS,
        [CLASSES.VISUALIZATION]: ROUTES.VISUALIZATIONS,
        [CLASSES.SMART_REVIEW_PUBLISHED]: ROUTES.REVIEWS,
        [CLASSES.LITERATURE_LIST_PUBLISHED]: ROUTES.LISTS,
    }[contentType];

    return (
        <>
            <Tabs
                className="box rounded"
                destroyInactiveTabPane
                onChange={onTabChange}
                activeKey={contentType}
                items={HOME_CONTENT_TABS.map((tab) => ({
                    label: <TabLabel label={tab.label} classId={tab.id} researchFieldId={researchFieldId} />,
                    key: tab.id,
                    children: (
                        <>
                            <div className="d-flex justify-content-end align-items-center my-2">
                                <ContentTypeVisibilityFilter isLoading={isLoading} />
                            </div>
                            <hr className="my-0" />
                            <ListPaginatedContent<Item>
                                renderListItem={renderListItem}
                                pageSize={pageSize}
                                label="research field"
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
                                showPagination={false}
                            />
                        </>
                    ),
                }))}
            />
            {!isLoading && hasNextPage && !!totalElements && totalElements > 0 && (
                <div className="text-center mt-2">
                    <Button
                        tag={Link}
                        href={
                            researchFieldId !== RESOURCES.RESEARCH_FIELD_MAIN
                                ? `${reverseWithSlug(ROUTES.RESEARCH_FIELD, {
                                      researchFieldId,
                                      slug: researchFieldLabel,
                                  })}?sort=${sort}&include_subfields=${includeSubFields}&contentType=${contentType}`
                                : contentTypeLink
                        }
                        color="primary"
                        size="sm"
                        className="flex-shrink-0 me-2"
                    >
                        View more
                    </Button>
                </div>
            )}
        </>
    );
}

export default HomeTabsContainer;
