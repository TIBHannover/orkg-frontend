import ContentTypeList from 'components/ContentTypeList/ContentTypeList';
import ContentTypeVisibilityFilter from 'components/ContentTypeList/ContentTypeVisibilityFilter';
import useResearchFieldContent from 'components/ResearchField/hooks/useResearchFieldContent';
import Tabs from 'components/Tabs/Tabs';
import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import { CLASSES, RESOURCES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import Link from 'next/link';
import { useQueryState } from 'nuqs';
import { Button } from 'reactstrap';
import { VisibilityOptions } from 'services/backend/types';
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

    const { items, isLoading, hasNextPage, isLastPageReached, totalElements, page, handleLoadMore } = useResearchFieldContent({
        researchFieldId,
        pageSize: 10,
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
                    label: tab.label,
                    key: tab.id,
                    children: (
                        <>
                            <div className="d-flex justify-content-end align-items-center my-2">
                                <ContentTypeVisibilityFilter isLoading={isLoading} />
                            </div>
                            <hr className="my-0" />
                            <ContentTypeList
                                contentType={tab.id}
                                pageLabel="featured"
                                isLoading={isLoading}
                                items={items ?? []}
                                hasNextPage={hasNextPage}
                                isLastPageReached={isLastPageReached}
                                totalElements={totalElements}
                                page={page}
                                handleLoadMore={handleLoadMore}
                                showLoadMore={false}
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
