import { Skeleton } from '@heroui/react';
import { ReactNode } from 'react';

import InternalServerError from '@/app/error';
import NotFound from '@/app/not-found';
import PaginationControl from '@/components/PaginatedContent/PaginationControl';
import ListGroup from '@/components/Ui/List/ListGroup';
import Container from '@/components/Ui/Structure/Container';

type ListPaginatedContentProps<ItemType> = {
    label: string;
    renderListItem: (item: ItemType, lastItem?: boolean, index?: number) => React.ReactNode;
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
        <div className={`text-left rounded ${boxShadow ? 'box' : ''}`}>
            {[...Array(5)].map((_, i) => (
                <div key={i} className="p-3 flex items-center gap-3 border-b border-divider last:border-b-0">
                    <div className="flex-1 flex flex-col gap-2">
                        <Skeleton className="w-3/5 h-4 rounded" />
                        <Skeleton className="w-2/5 h-3 rounded" />
                    </div>
                </div>
            ))}
        </div>
    ),
    noDataComponent = (
        <div className={boxShadow ? 'container mx-auto px-4 box rounded' : ''}>
            <div className="p-12 text-center mt-6 mb-6">There are no content for this {label} that matches this filter, yet</div>
        </div>
    ),
}: ListPaginatedContentProps<ItemType>) => {
    // Extract flush from listGroupProps to avoid passing it to non-ListGroup components
    const { flush: _, ...safeListGroupProps } = listGroupProps;
    const componentProps = ListGroupComponent === ListGroup ? listGroupProps : safeListGroupProps;
    return (
        <Container className="px-0">
            {isLoading && loadingComponent}
            {!isLoading && error && error.statusCode === 404 && <NotFound />}
            {!isLoading && error && error.statusCode !== 404 && <InternalServerError error={error} />}
            {!isLoading && items && items.length > 0 && (
                <ListGroupComponent {...componentProps} className={`${boxShadow ? 'box' : ''} rounded`} style={{ clear: 'both' }}>
                    {items?.map((item, index) => renderListItem(item, index === items.length - 1, page * pageSize + index))}
                </ListGroupComponent>
            )}
            {!isLoading && !error && items && items.length === 0 && noDataComponent}
            {showPagination && !isLoading && !!totalElements && !!totalPages && totalPages > 1 && totalElements > 0 && (
                <div className="mt-4">
                    {!isLoading && flush && !boxShadow && <hr />}
                    {!isLoading && boxShadow && <div className="mt-2" />}
                    <div className={`${flush ? 'ml-2 mr-2' : ''}`}>
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
