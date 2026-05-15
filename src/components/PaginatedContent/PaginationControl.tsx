import { cn, Label, ListBox, NumberField, Pagination, paginationVariants, Select } from '@heroui/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createSerializer, parseAsInteger } from 'nuqs';
import { FC, useMemo } from 'react';

type PaginationControlProps = {
    page: number;
    setPage: (page: number) => void;
    totalPages: number;
    pageSize: number;
    setPageSize: (pageSize: number) => void;
    prefixParams?: string;
    isLoading: boolean;
    hasNextPage: boolean;
    totalElements: number;
    boxShadow?: boolean;
};

const PAGE_SIZE_OPTIONS = [15, 30, 60, 100];

const PaginationControl: FC<PaginationControlProps> = ({
    page,
    setPage,
    totalPages,
    pageSize,
    setPageSize,
    isLoading,
    hasNextPage,
    totalElements,
    boxShadow,
    prefixParams = '',
}) => {
    const paginationParams = {
        [`${prefixParams}page`]: parseAsInteger,
    };

    const searchParams = useSearchParams();
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.delete(`${prefixParams}page`);
    const currentParamsString = `?${currentParams.toString()}`;

    const serialize = createSerializer(paginationParams);

    const pageNumbers = useMemo(() => {
        const pages: number[] = [];
        const startPage = Math.max(0, page - 3);
        const endPage = Math.min(totalPages - 1, page + 3);
        for (let i = startPage; i <= endPage; i += 1) {
            pages.push(i);
        }
        return pages;
    }, [page, totalPages]);

    const slots = useMemo(() => paginationVariants({ size: 'md' }), []);

    const pageSizeOptions = useMemo(
        () => (PAGE_SIZE_OPTIONS.includes(pageSize) ? PAGE_SIZE_OPTIONS : [...PAGE_SIZE_OPTIONS, pageSize].sort((a, b) => a - b)),
        [pageSize],
    );

    const disabledLinkProps = {
        'aria-disabled': true as const,
        tabIndex: -1,
        onClick: (e: React.MouseEvent) => e.preventDefault(),
    };

    return (
        <Pagination size="md" aria-label="Page navigation" className={cn('w-full', boxShadow ? 'mb-0 shadow-sm bg-surface rounded-lg' : 'mt-2 mb-2')}>
            <Pagination.Content className="w-full flex-wrap gap-y-2 p-1">
                <Pagination.Item>
                    <Link
                        href={page === 0 ? '#' : serialize(currentParamsString, { [`${prefixParams}page`]: page - 1 })}
                        className={cn(slots.link(), 'pagination__link--nav')}
                        title="Previous page"
                        {...(page === 0 ? disabledLinkProps : {})}
                    >
                        <Pagination.PreviousIcon />
                    </Link>
                </Pagination.Item>
                {pageNumbers[0] > 0 && (
                    <>
                        <Pagination.Item>
                            <Link
                                href={serialize(currentParamsString, { [`${prefixParams}page`]: 0 })}
                                className={cn(slots.link(), 'min-w-9 w-auto px-2 md:min-w-8')}
                                title="First page"
                                {...(page === 0 ? disabledLinkProps : {})}
                            >
                                1
                            </Link>
                        </Pagination.Item>
                        {pageNumbers[0] !== 1 && (
                            <Pagination.Item>
                                <Pagination.Ellipsis />
                            </Pagination.Item>
                        )}
                    </>
                )}
                {pageNumbers.map((_page) => (
                    <Pagination.Item key={_page}>
                        <Link
                            href={serialize(currentParamsString, { [`${prefixParams}page`]: _page })}
                            className={cn(slots.link(), 'min-w-9 w-auto px-2 md:min-w-8')}
                            title={`Page ${_page + 1}`}
                            data-active={page === _page ? 'true' : undefined}
                            aria-current={page === _page ? 'page' : undefined}
                            {...(page === _page ? disabledLinkProps : {})}
                        >
                            {_page + 1}
                        </Link>
                    </Pagination.Item>
                ))}
                {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                    <>
                        {pageNumbers[pageNumbers.length - 1] < totalPages - 2 && (
                            <Pagination.Item>
                                <Pagination.Ellipsis />
                            </Pagination.Item>
                        )}
                        <Pagination.Item>
                            <Link
                                href={serialize(currentParamsString, { [`${prefixParams}page`]: totalPages - 1 })}
                                className={cn(slots.link(), 'min-w-9 w-auto px-2 md:min-w-8')}
                                title="Last page"
                                {...(!hasNextPage ? disabledLinkProps : {})}
                            >
                                {totalPages}
                            </Link>
                        </Pagination.Item>
                    </>
                )}
                <Pagination.Item>
                    <Link
                        href={!hasNextPage ? '#' : serialize(currentParamsString, { [`${prefixParams}page`]: page + 1 })}
                        className={cn(slots.link(), 'pagination__link--nav')}
                        title="Next page"
                        {...(!hasNextPage ? disabledLinkProps : {})}
                    >
                        <Pagination.NextIcon />
                    </Link>
                </Pagination.Item>
                <Pagination.Item className="grow">
                    <span className="inline-flex items-center pl-2 text-sm text-muted">
                        {page * pageSize + 1}-{Math.min(page * pageSize + pageSize, totalElements)} of {totalElements}
                    </span>
                </Pagination.Item>
                <Pagination.Item>
                    <NumberField
                        aria-label="Go to page"
                        minValue={1}
                        maxValue={totalPages}
                        value={page + 1}
                        step={1}
                        onChange={(v) => setPage(v - 1)}
                        className="flex flex-row items-center gap-1.5"
                    >
                        <Label className="text-sm whitespace-nowrap">Page</Label>
                        <NumberField.Group className="[grid-template-columns:28px_1fr_28px]">
                            <NumberField.DecrementButton className="w-7" />
                            <NumberField.Input className="w-16 text-center" />
                            <NumberField.IncrementButton className="w-7" />
                        </NumberField.Group>
                    </NumberField>
                </Pagination.Item>
                <Pagination.Item className="ms-2">
                    <Select
                        aria-label="Items per page"
                        value={String(pageSize)}
                        onChange={(key) => {
                            setPageSize(Number(key));
                            setPage(0);
                        }}
                        isDisabled={isLoading}
                        className="flex flex-row items-center gap-1.5"
                    >
                        <Label className="text-sm whitespace-nowrap">Show</Label>
                        <Select.Trigger className="min-w-20">
                            <Select.Value />
                            <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                            <ListBox>
                                {pageSizeOptions.map((size) => (
                                    <ListBox.Item key={String(size)} id={String(size)} textValue={String(size)}>
                                        {size}
                                        <ListBox.ItemIndicator />
                                    </ListBox.Item>
                                ))}
                            </ListBox>
                        </Select.Popover>
                    </Select>
                </Pagination.Item>
            </Pagination.Content>
        </Pagination>
    );
};

export default PaginationControl;
