import { Separator } from '@heroui/react';
import Link from 'next/link';
import { FC } from 'react';

import Item from '@/app/search/components/Item/Item';
import PaginationControl from '@/components/PaginatedContent/PaginationControl';
import { CardBadge } from '@/components/styled';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
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
            <ul className="divide-y divide-border rounded pt-2 list-none m-0 p-0">
                {items.map((item) => (
                    <li key={item.id} className="py-6 px-4">
                        <Item item={item} />
                    </li>
                ))}
                {page === 0 && isAuthorExists && (
                    <li key="result-searchTerm" className="py-6 px-4" style={{ overflowWrap: 'anywhere' }}>
                        <div className="flex items-center gap-2">
                            <Link href={reverse(ROUTES.AUTHOR_LITERAL, { authorString: query })}>{query}</Link>
                            <CardBadge color="primary">Author</CardBadge>
                        </div>
                    </li>
                )}
            </ul>
        )}
        {!!totalElements && !!totalPages && totalPages > 1 && totalElements > 0 && (
            <div className="mt-4">
                <Separator className="mb-4" />
                <div className="mx-2">
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
