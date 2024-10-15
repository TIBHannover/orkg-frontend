import ContentTypeList from 'components/ContentTypeList/ContentTypeList';
import ContentTypeListHeader from 'components/ContentTypeList/ContentTypeListHeader';
import useResearchFieldContent from 'components/ResearchField/hooks/useResearchFieldContent';
import Tabs from 'components/Tabs/Tabs';
import { CLASSES } from 'constants/graphSettings';
import { useQueryState } from 'nuqs';

export const RESEARCH_FIELD_CONTENT_TABS = [
    { id: CLASSES.COMPARISON, label: 'Comparisons' },
    { id: CLASSES.PAPER, label: 'Papers' },
    { id: CLASSES.VISUALIZATION, label: 'Visualizations' },
    { id: CLASSES.SMART_REVIEW_PUBLISHED, label: 'Reviews' },
    { id: CLASSES.LITERATURE_LIST_PUBLISHED, label: 'Lists' },
];

function ResearchFieldTabsContainer({ id }: { id: string }) {
    const [contentType, setContentType] = useQueryState('contentType', { defaultValue: CLASSES.COMPARISON });

    const onTabChange = (tab: string) => {
        setContentType(tab, { scroll: false, history: 'push' });
    };

    const { items, isLoading, hasNextPage, isLastPageReached, totalElements, page, handleLoadMore } = useResearchFieldContent({
        researchFieldId: id,
    });

    return (
        <>
            <ContentTypeListHeader isLoading={isLoading} totalElements={totalElements} page={page} showSubFieldsFilter />

            <Tabs
                className="box rounded mt-2"
                destroyInactiveTabPane
                onChange={onTabChange}
                activeKey={contentType}
                items={RESEARCH_FIELD_CONTENT_TABS.map((tab) => ({
                    label: tab.label,
                    key: tab.id,
                    children: (
                        <ContentTypeList
                            contentType={tab.id}
                            pageLabel="research field"
                            isLoading={isLoading}
                            items={items ?? []}
                            hasNextPage={hasNextPage}
                            isLastPageReached={isLastPageReached}
                            totalElements={totalElements}
                            page={page}
                            handleLoadMore={handleLoadMore}
                        />
                    ),
                }))}
            />
        </>
    );
}

export default ResearchFieldTabsContainer;
