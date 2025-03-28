import { ReactNode } from 'react';
import { Container, ListGroup } from 'reactstrap';

import InternalServerError from '@/app/error';
import NotFound from '@/app/not-found';
import ContentLoader from '@/components/ContentLoader/ContentLoader';
import PaginationControl from '@/components/PaginatedContent/PaginationControl';

type ListPaginatedContentProps<ItemType> = {
    label: string;
    renderListItem: (item: ItemType, lastItem?: boolean) => React.ReactNode;
    boxShadow?: boolean;
    isLoading: boolean;
    error: ({ statusCode?: number } & Error) | null;
    items: ItemType[];
    hasNextPage: boolean;
    totalElements?: number;
    page: number;
    totalPages?: number;
    pageSize: number;
    setPage: (page: number) => void;
    setPageSize: (pageSize: number) => void;
    prefixParams?: string;
    showPagination?: boolean;
    flush?: boolean;
    loadingComponent?: ReactNode;
    ListGroupComponent?: React.ComponentType<any>;
    listGroupProps?: React.ComponentProps<typeof ListGroup>;
    noDataComponent?: ReactNode;
};

const ListPaginatedContent = <ItemType,>({
    label,
    renderListItem,
    boxShadow = true,
    isLoading,
    error,
    items,
    hasNextPage,
    totalElements,
    page,
    totalPages,
    pageSize,
    setPage,
    setPageSize,
    showPagination = true,
    prefixParams = '',
    ListGroupComponent = ListGroup,
    flush = true,
    listGroupProps = {
        flush,
    },
    loadingComponent = (
        <div className={`text-start p-5 container rounded ${boxShadow ? 'box' : ''}`}>
            <ContentLoader speed={2} width={400} height={50} viewBox="0 0 400 50" style={{ width: '100% !important' }}>
                <rect x="0" y="0" rx="3" ry="3" width="400" height="20" />
                <rect x="0" y="25" rx="3" ry="3" width="300" height="20" />
            </ContentLoader>
        </div>
    ),
    noDataComponent = (
        <div className={boxShadow ? 'container box rounded' : ''}>
            <div className="p-5 text-center mt-4 mb-4">There are no content for this {label} that matches this filter, yet</div>
        </div>
    ),
}: ListPaginatedContentProps<ItemType>) => {
    return (
        <Container className="p-0">
            {isLoading && loadingComponent}
            {!isLoading && error && error.statusCode === 404 && <NotFound />}
            {!isLoading && error && error.statusCode !== 404 && <InternalServerError error={error} />}
            {!isLoading && items && items.length > 0 && (
                <ListGroupComponent {...listGroupProps} className={`${boxShadow ? 'box' : ''} rounded`} style={{ clear: 'both' }}>
                    {items?.map((item, index) => renderListItem(item, index === items.length - 1))}
                </ListGroupComponent>
            )}
            {!isLoading && !error && items && items.length === 0 && noDataComponent}
            {showPagination && !isLoading && !!totalElements && !!totalPages && totalPages > 1 && totalElements > 0 && (
                <div className="mt-3">
                    {!isLoading && flush && !boxShadow && <hr />}
                    {!isLoading && boxShadow && <div className="mt-2" />}
                    <div className={`${flush ? 'ms-2 me-2' : ''}`}>
                        <PaginationControl
                            prefixParams={prefixParams}
                            page={page}
                            setPage={setPage}
                            totalPages={totalPages}
                            pageSize={pageSize}
                            setPageSize={setPageSize}
                            isLoading={isLoading}
                            hasNextPage={hasNextPage}
                            totalElements={totalElements}
                            boxShadow={boxShadow}
                        />
                    </div>
                </div>
            )}
        </Container>
    );
};

export default ListPaginatedContent;
