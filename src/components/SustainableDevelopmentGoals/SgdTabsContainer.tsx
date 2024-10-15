import ContentTypeList from 'components/ContentTypeList/ContentTypeList';
import ContentTypeListHeader from 'components/ContentTypeList/ContentTypeListHeader';
import useSdgContent from 'components/SustainableDevelopmentGoals/hooks/useSdgContent';
import Tabs from 'components/Tabs/Tabs';
import { CLASSES } from 'constants/graphSettings';
import { useQueryState } from 'nuqs';
import { FC } from 'react';
import { Container } from 'reactstrap';

type SgdTabsContainerProps = {
    sdgId: string;
};

export const SDG_CONTENT_TABS = [
    { id: CLASSES.COMPARISON, label: 'Comparisons' },
    { id: CLASSES.PAPER, label: 'Papers' },
    { id: CLASSES.VISUALIZATION, label: 'Visualizations' },
    { id: CLASSES.SMART_REVIEW_PUBLISHED, label: 'Reviews' },
    { id: CLASSES.LITERATURE_LIST_PUBLISHED, label: 'Lists' },
];

const SgdTabsContainer: FC<SgdTabsContainerProps> = ({ sdgId }) => {
    const [contentType, setContentType] = useQueryState('contentType', { defaultValue: CLASSES.COMPARISON });

    const { items, isLoading, hasNextPage, isLastPageReached, totalElements, page, handleLoadMore } = useSdgContent({
        sdgId,
    });

    const onTabChange = (tab: string) => {
        setContentType(tab, { scroll: false, history: 'push' });
    };

    return (
        <Container className="mt-4 p-0">
            <ContentTypeListHeader isLoading={isLoading} totalElements={totalElements} page={page} />

            <Tabs
                className="box rounded"
                destroyInactiveTabPane
                onChange={onTabChange}
                activeKey={contentType}
                items={SDG_CONTENT_TABS.map((tab) => ({
                    label: tab.label,
                    key: tab.id,
                    children: (
                        <ContentTypeList
                            contentType={tab.id}
                            pageLabel="SDG"
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
        </Container>
    );
};

export default SgdTabsContainer;
