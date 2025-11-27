import { flatten } from 'lodash';
import { reverse } from 'named-urls';
import { useRouter } from 'next/navigation';
import { useQueryState } from 'nuqs';
import { useEffect, useState } from 'react';

import CardFactory from '@/components/Cards/CardFactory/CardFactory';
import ContentTypeListHeader from '@/components/ContentTypeList/ContentTypeListHeader';
import usePaginate from '@/components/PaginatedContent/hooks/usePaginate';
import ListPaginatedContent from '@/components/PaginatedContent/ListPaginatedContent';
import TabLabel from '@/components/Tabs/TabLabel';
import Tabs from '@/components/Tabs/Tabs';
import Button from '@/components/Ui/Button/Button';
import useDeletePapers from '@/components/ViewPaper/hooks/useDeletePapers';
import { VISIBILITY_FILTERS } from '@/constants/contentTypes';
import { CLASSES } from '@/constants/graphSettings';
import { ALL_CONTENT_TYPES_ID } from '@/constants/misc';
import ROUTES from '@/constants/routes';
import { contentTypesUrl, getContentTypes } from '@/services/backend/contentTypes';
import { Item, Paper, VisibilityOptions } from '@/services/backend/types';

export const USER_PROFILE_CONTENT_TABS = [
    { id: ALL_CONTENT_TYPES_ID, label: 'All', description: 'All content types except statements and statements types' },
    { id: CLASSES.COMPARISON, label: 'Comparisons', params: { published: true } },
    { id: CLASSES.PAPER, label: 'Papers', params: { published: undefined } },
    { id: CLASSES.VISUALIZATION, label: 'Visualizations', params: { published: undefined } },
    { id: CLASSES.SMART_REVIEW_PUBLISHED, label: 'Reviews', params: { published: true } },
    { id: CLASSES.LITERATURE_LIST_PUBLISHED, label: 'Lists', params: { published: true } },
    { id: CLASSES.NODE_SHAPE, label: 'Templates', params: { published: undefined } },
    { id: CLASSES.ROSETTA_NODE_SHAPE, label: 'Statement templates', params: { published: undefined } },
];

function UserProfileTabsContainer({ id, currentUserId }: { id: string; currentUserId: string }) {
    const router = useRouter();
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    const [contentType, setContentType] = useQueryState('contentType', { defaultValue: ALL_CONTENT_TYPES_ID });

    const [sort] = useQueryState<VisibilityOptions>('sort', {
        defaultValue: VISIBILITY_FILTERS.TOP_RECENT,
        parse: (value) => value as VisibilityOptions,
    });

    const handleSelect = (paperId: string) => {
        if (selectedItems.includes(paperId)) {
            setSelectedItems(selectedItems.filter((id) => id !== paperId));
        } else {
            setSelectedItems([...selectedItems, paperId]);
        }
    };

    const renderListItem = (item: Item) => (
        <CardFactory
            showBadge={contentType === ALL_CONTENT_TYPES_ID}
            showCurationFlags
            showAddToComparison
            key={item.id}
            item={item}
            selectable={id === currentUserId}
            selected={selectedItems.includes(item.id)}
            onSelect={() => handleSelect(item.id)}
        />
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
        mutate,
    } = usePaginate({
        fetchFunction: getContentTypes,
        fetchUrl: contentTypesUrl,
        fetchFunctionName: 'getContentTypes',
        fetchExtraParams: {
            created_by: id,
            visibility: sort,
            contentType,
            published: true,
        },
    });

    const onTabChange = (tab: string) => {
        setContentType(tab, { scroll: false, history: 'push' });
        setPage(0);
    };

    const { deletePapers, isLoading: loadingDeletePapers } = useDeletePapers({
        paperIds: selectedItems,
        finishLoadingCallback: mutate,
    });

    const comparePapers = () => {
        const contributionIds = flatten(
            (flatten(items).filter((r) => selectedItems.includes(r.id)) as Paper[])?.map((c) => c.contributions?.map((ctrId) => ctrId.id)),
        );
        router.push(`${reverse(ROUTES.COMPARISON_NOT_PUBLISHED)}?contributions=${contributionIds.join(',')}`);
    };

    useEffect(() => {
        if (loadingDeletePapers) {
            mutate?.();
            setSelectedItems([]);
        }
    }, [loadingDeletePapers, mutate]);

    return (
        <>
            <ContentTypeListHeader isLoading={isLoading} totalElements={totalElements} />

            <Tabs
                className="box rounded mt-2"
                destroyOnHidden
                onChange={onTabChange}
                activeKey={contentType}
                items={USER_PROFILE_CONTENT_TABS.map((tab) => ({
                    label: (
                        <TabLabel
                            label={tab.label}
                            classId={tab.id}
                            description={tab.description}
                            showCount
                            countParams={{
                                createdBy: id,
                                visibility: sort,
                                published: tab.params?.published,
                            }}
                        />
                    ),
                    key: tab.id,
                    children: (
                        <>
                            <ListPaginatedContent<Item>
                                renderListItem={renderListItem}
                                pageSize={pageSize}
                                label="user"
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
                            {contentType === CLASSES.PAPER && selectedItems.length > 0 && (
                                <div className="mx-2 my-2">
                                    <Button size="sm" color="secondary" className="mt-2 me-2" onClick={comparePapers}>
                                        Compare selected papers({selectedItems.length})
                                    </Button>

                                    <Button size="sm" color="danger" className="mt-2" onClick={deletePapers}>
                                        Delete selected papers ({selectedItems.length})
                                    </Button>
                                </div>
                            )}
                        </>
                    ),
                }))}
            />
        </>
    );
}

export default UserProfileTabsContainer;
