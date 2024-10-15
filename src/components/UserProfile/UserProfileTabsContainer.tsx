import ContentTypeList from 'components/ContentTypeList/ContentTypeList';
import ContentTypeListHeader from 'components/ContentTypeList/ContentTypeListHeader';
import Tabs from 'components/Tabs/Tabs';
import useUserProfileContent from 'components/UserProfile/hooks/useUserProfileContent';
import { CLASSES } from 'constants/graphSettings';
import { ALL_CONTENT_TYPES_ID } from 'constants/misc';
import { parseAsJson, useQueryState } from 'nuqs';
import { FilterConfig } from 'services/backend/types';

export const USER_PROFILE_CONTENT_TABS = [
    { id: ALL_CONTENT_TYPES_ID, label: 'All' },
    { id: CLASSES.COMPARISON, label: 'Comparisons' },
    { id: CLASSES.PAPER, label: 'Papers' },
    { id: CLASSES.VISUALIZATION, label: 'Visualizations' },
    { id: CLASSES.SMART_REVIEW_PUBLISHED, label: 'Reviews' },
    { id: CLASSES.LITERATURE_LIST_PUBLISHED, label: 'Lists' },
    { id: CLASSES.NODE_SHAPE, label: 'Templates' },
    { id: CLASSES.ROSETTA_NODE_SHAPE, label: 'Statement types' },
];

function UserProfileTabsContainer({ id, currentUserId }: { id: string; currentUserId: string }) {
    const [contentType, setContentType] = useQueryState('contentType', { defaultValue: ALL_CONTENT_TYPES_ID });
    const [, setFilterConfig] = useQueryState<FilterConfig[]>('filter_config', parseAsJson());

    const onTabChange = (tab: string) => {
        setFilterConfig(null);
        setContentType(tab, { scroll: false, history: 'push' });
    };

    const { items, isLoading, hasNextPage, isLastPageReached, totalElements, page, handleLoadMore, mutate } = useUserProfileContent({
        userId: id,
    });

    return (
        <>
            <ContentTypeListHeader isLoading={isLoading} totalElements={totalElements} page={page} />

            <Tabs
                className="box rounded mt-2"
                destroyInactiveTabPane
                onChange={onTabChange}
                activeKey={contentType}
                items={USER_PROFILE_CONTENT_TABS.map((tab) => ({
                    label: tab.label,
                    key: tab.id,
                    children: (
                        <ContentTypeList
                            contentType={tab.id}
                            pageLabel="user"
                            isLoading={isLoading}
                            items={items ?? []}
                            hasNextPage={hasNextPage}
                            isLastPageReached={isLastPageReached}
                            totalElements={totalElements}
                            page={page}
                            handleLoadMore={handleLoadMore}
                            mutate={mutate}
                            showDelete={id === currentUserId}
                        />
                    ),
                }))}
            />
        </>
    );
}

export default UserProfileTabsContainer;
