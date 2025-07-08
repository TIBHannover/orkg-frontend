import { useQueryState } from 'nuqs';

import CardFactory from '@/components/Cards/CardFactory/CardFactory';
import ContentTypeListHeader from '@/components/ContentTypeList/ContentTypeListHeader';
import usePaginate from '@/components/PaginatedContent/hooks/usePaginate';
import ListPaginatedContent from '@/components/PaginatedContent/ListPaginatedContent';
import Tabs from '@/components/Tabs/Tabs';
import { VISIBILITY_FILTERS } from '@/constants/contentTypes';
import { CLASSES } from '@/constants/graphSettings';
import { getResearchProblemContent, problemsUrl } from '@/services/backend/problems';
import { Item, VisibilityOptions } from '@/services/backend/types';

export const RESEARCH_PROBLEM_CONTENT_TABS = [
    { id: CLASSES.PAPER, label: 'Papers' },
    { id: CLASSES.COMPARISON, label: 'Comparisons' },
    { id: CLASSES.VISUALIZATION, label: 'Visualizations' },
    // { id: CLASSES.SMART_REVIEW_PUBLISHED, label: 'Reviews' },
    // { id: CLASSES.LITERATURE_LIST_PUBLISHED, label: 'Lists' },
];

function ResearchProblemTabsContainer({ id }: { id: string }) {
    const [contentType, setContentType] = useQueryState('contentType', { defaultValue: CLASSES.PAPER });
    const [sort] = useQueryState<VisibilityOptions>('sort', {
        defaultValue: VISIBILITY_FILTERS.TOP_RECENT,
        parse: (value) => value as VisibilityOptions,
    });

    const renderListItem = (item: Item) => <CardFactory showBadge showCurationFlags showAddToComparison key={`item${item.id}`} item={item} />;

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
        fetchFunction: getResearchProblemContent,
        fetchUrl: problemsUrl,
        fetchFunctionName: 'getResearchProblemContent',
        fetchExtraParams: {
            id,
            classes: [contentType],
            visibility: sort,
        },
    });

    const onTabChange = (tab: string) => {
        setContentType(tab, { scroll: false, history: 'push' });
        setPage(0);
    };

    return (
        <>
            <ContentTypeListHeader isLoading={isLoading} totalElements={totalElements} showSubFieldsFilter={false} />

            <Tabs
                className="box rounded mt-2"
                destroyOnHidden
                onChange={onTabChange}
                activeKey={contentType}
                items={RESEARCH_PROBLEM_CONTENT_TABS.map((tab) => ({
                    label: tab.label,
                    key: tab.id,
                    children: (
                        <ListPaginatedContent<Item>
                            renderListItem={renderListItem}
                            pageSize={pageSize}
                            label="Research Problem"
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

export default ResearchProblemTabsContainer;
