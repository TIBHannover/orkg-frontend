'use client';

import { useQueryState } from 'nuqs';

import AuthorHeader from '@/components/Author/AuthorHeader';
import CardFactory from '@/components/Cards/CardFactory/CardFactory';
import ContentTypeListHeader from '@/components/ContentTypeList/ContentTypeListHeader';
import usePaginate from '@/components/PaginatedContent/hooks/usePaginate';
import ListPaginatedContent from '@/components/PaginatedContent/ListPaginatedContent';
import Tabs from '@/components/Tabs/Tabs';
import TitleBar from '@/components/TitleBar/TitleBar';
import Alert from '@/components/Ui/Alert/Alert';
import Container from '@/components/Ui/Structure/Container';
import useParams from '@/components/useParams/useParams';
import { VISIBILITY_FILTERS } from '@/constants/contentTypes';
import { CLASSES } from '@/constants/graphSettings';
import { ALL_CONTENT_TYPES_ID } from '@/constants/misc';
import { contentTypesUrl, getContentTypes } from '@/services/backend/contentTypes';
import { Item, VisibilityOptions } from '@/services/backend/types';

const AUTHOR_CONTENT_TABS = [
    { id: ALL_CONTENT_TYPES_ID, label: 'All' },
    { id: CLASSES.COMPARISON, label: 'Comparisons' },
    { id: CLASSES.PAPER, label: 'Papers' },
    { id: CLASSES.VISUALIZATION, label: 'Visualizations' },
    { id: CLASSES.SMART_REVIEW_PUBLISHED, label: 'Reviews' },
    { id: CLASSES.LITERATURE_LIST_PUBLISHED, label: 'Lists' },
];

const AuthorPage = () => {
    const { authorId, authorString } = useParams();
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
            ...(authorId ? { author_id: authorId } : {}),
            ...(authorString ? { author_name: authorString } : {}),
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
        <Container className="p-0">
            {authorId && <AuthorHeader authorId={authorId} />}
            {authorString && <TitleBar titleAddition={<div className="text-muted">Author</div>}>{authorString}</TitleBar>}

            {authorString && (
                <Alert color="info" className="box-shadow">
                    Results include work from all authors matching this name. This means that the results may include work by other people with the
                    same name.
                </Alert>
            )}

            <ContentTypeListHeader label="Works" isLoading={isLoading} totalElements={totalElements} />

            <Tabs
                className="box rounded mt-2"
                destroyOnHidden
                onChange={onTabChange}
                activeKey={contentType}
                items={AUTHOR_CONTENT_TABS.map((tab) => ({
                    label: tab.label,
                    key: tab.id,
                    children: (
                        <ListPaginatedContent<Item>
                            renderListItem={renderListItem}
                            pageSize={pageSize}
                            label="observatory"
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

export default AuthorPage;
