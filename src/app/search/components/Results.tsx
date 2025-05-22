import { reverse } from 'named-urls';
import Link from 'next/link';
import { FC } from 'react';
import { ListGroup, ListGroupItem } from 'reactstrap';

import Item from '@/app/search/components/Item/Item';
import PaginationControl from '@/components/PaginatedContent/PaginationControl';
import { CardBadge } from '@/components/styled';
import ROUTES from '@/constants/routes';
import { Thing } from '@/services/backend/things';

interface ResultsProps {
    query: string;
    items: Thing[];
    hasNextPage: boolean;
    page: number;
    setPage: (page: number) => void;
    totalPages: number;
    pageSize: number;
    setPageSize: (pageSize: number) => void;
    isLoading: boolean;
    totalElements: number;
    isAuthorExists: boolean;
}

const Results: FC<ResultsProps> = ({
    query,
    items,
    hasNextPage,
    page,
    setPage,
    totalPages,
    pageSize,
    setPageSize,
    isLoading,
    totalElements,
    isAuthorExists,
}) => (
    <div>
        {items.length > 0 && (
            <ListGroup flush className="rounded pt-2">
                {items.map((item) => (
                    <Item key={item.id} item={item} />
                ))}
                {page === 0 && isAuthorExists && (
                    <ListGroupItem key="result-searchTerm" className="py-2" style={{ overflowWrap: 'anywhere' }}>
                        <div className="d-flex align-items-center my-3">
                            <Link href={reverse(ROUTES.AUTHOR_LITERAL, { authorString: encodeURIComponent(query) })}>{query}</Link>
                            <div className="d-inline-block ms-2 flex-shrink-0">
                                <CardBadge color="primary">Author</CardBadge>
                            </div>
                        </div>
                    </ListGroupItem>
                )}
            </ListGroup>
        )}
        {!!totalElements && !!totalPages && totalPages > 1 && totalElements > 0 && (
            <div className="mt-3">
                <hr />
                <div className="mt-2" />
                <div className="ms-2 me-2">
                    <PaginationControl
                        page={page}
                        setPage={setPage}
                        totalPages={totalPages}
                        pageSize={pageSize}
                        setPageSize={setPageSize}
                        isLoading={isLoading}
                        hasNextPage={hasNextPage}
                        totalElements={totalElements}
                        boxShadow={false}
                    />
                </div>
            </div>
        )}
    </div>
);

export default Results;
