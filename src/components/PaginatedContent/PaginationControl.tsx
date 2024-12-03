import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createSerializer, parseAsInteger } from 'nuqs';
import { FC } from 'react';
import { Input, InputGroup, Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import styled from 'styled-components';

type PaginationProps = {
    page: number;
    setPage: (page: number) => void;
    totalPages: number;
    pageSize: number;
    setPageSize: (pageSize: number) => void;
    isLoading: boolean;
    hasNextPage: boolean;
    totalElements: number;
    boxShadow?: boolean;
};

const PaginationStyle = styled(Pagination)`
    a.disabled {
        pointer-events: none;
    }
    ul {
        display: flex;
        flex-grow: 1;
        flex-wrap: wrap;
        row-gap: 0.5rem;
        margin: 0;
    }
    @media (max-width: ${(props) => props.theme.gridBreakpoints.lg}) {
        & {
            box-shadow: none;
        }
        ul {
            li:last-child .input-group > .input-group-text:first-child {
                border-top-left-radius: ${(props) => props.theme.borderRadius} !important;
                border-bottom-left-radius: ${(props) => props.theme.borderRadius} !important;
            }
        }
    }
`;

const PaginationControl: FC<PaginationProps> = ({
    page,
    setPage,
    totalPages,
    pageSize,
    setPageSize,
    isLoading,
    hasNextPage,
    totalElements,
    boxShadow,
}) => {
    const paginationParams = {
        page: parseAsInteger,
    };

    const searchParams = useSearchParams();
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.delete('page');
    const currentParamsString = `?${currentParams.toString()}`;

    const serialize = createSerializer(paginationParams);

    const getPageNumbers = () => {
        const pages = [];
        // Show 3 pages before and after the current page
        const startPage = Math.max(0, page - 3);
        const endPage = Math.min(totalPages - 1, page + 3);
        for (let i = startPage; i <= endPage; i += 1) {
            pages.push(i);
        }
        return pages;
    };

    const disabledProps = {
        className: 'disabled',
        'aria-disabled': true,
        tabIndex: -1,
    };

    return (
        <PaginationStyle size="md" aria-label="Page navigation" className={`d-flex ${boxShadow ? 'box-shadow mb-0' : 'mb-2'} rounded`}>
            <PaginationItem
                tag={Link}
                href={serialize(currentParamsString, { page: page - 1 })}
                title="Previous page"
                {...(page === 0 ? disabledProps : {})}
            >
                <PaginationLink previous />
            </PaginationItem>

            {getPageNumbers()[0] > 0 && (
                <>
                    <PaginationItem
                        tag={Link}
                        href={serialize(currentParamsString, { page: 0 })}
                        title="First page"
                        {...(page === 0 ? disabledProps : {})}
                    >
                        <PaginationLink>1</PaginationLink>
                    </PaginationItem>
                    {getPageNumbers()[0] !== 1 && (
                        <PaginationItem
                            tag={Link}
                            href={serialize(currentParamsString, { page: getPageNumbers()[0] - 1 })}
                            title={`Page ${getPageNumbers()[0]}`}
                        >
                            <PaginationLink>...</PaginationLink>
                        </PaginationItem>
                    )}
                </>
            )}
            {getPageNumbers().map((_page) => (
                <PaginationItem
                    key={_page}
                    tag={Link}
                    href={serialize(currentParamsString, { page: _page })}
                    title={`Page ${_page + 1}`}
                    active={page === _page}
                    {...(page === _page ? disabledProps : {})}
                >
                    <PaginationLink>{_page + 1}</PaginationLink>
                </PaginationItem>
            ))}
            {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && (
                <>
                    {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 2 && (
                        <PaginationItem tag={Link} href={serialize(currentParamsString, { page: getPageNumbers()[getPageNumbers().length - 1] + 1 })}>
                            <PaginationLink>...</PaginationLink>
                        </PaginationItem>
                    )}
                    <PaginationItem
                        tag={Link}
                        href={serialize(currentParamsString, { page: totalPages - 1 })}
                        title="Last page"
                        {...(!hasNextPage ? disabledProps : {})}
                    >
                        <PaginationLink>{totalPages}</PaginationLink>
                    </PaginationItem>
                </>
            )}
            <PaginationItem
                tag={Link}
                href={serialize(currentParamsString, { page: page + 1 })}
                title="Next page"
                {...(!hasNextPage ? disabledProps : {})}
            >
                <PaginationLink next />
            </PaginationItem>
            <PaginationItem className="flex-grow-1 flex-shrink-0" disabled>
                <PaginationLink tag="div" className="ps-3">
                    {page * pageSize + 1}-{Math.min(page * pageSize + pageSize, totalElements)} of {totalElements}
                </PaginationLink>
            </PaginationItem>

            <PaginationItem active title="Current page" className="d-flex">
                <InputGroup>
                    <span className="input-group-text rounded-0">Page</span>
                    <Input
                        className="rounded-0"
                        type="number"
                        value={page + 1}
                        onChange={(e) => {
                            setPage(e.target.value ? Number(e.target.value) - 1 : 0);
                        }}
                        style={{ maxWidth: 100 }}
                    />
                    <span className="input-group-text rounded-0">Show</span>
                    <Input
                        defaultValue={pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setPage(0);
                        }}
                        type="select"
                        name="selectPageSize"
                        disabled={isLoading}
                        style={{ maxWidth: 100 }}
                    >
                        {[15, 30, 60, 100].map((_pageSize) => (
                            <option key={_pageSize} value={_pageSize}>
                                {_pageSize}
                            </option>
                        ))}
                    </Input>
                </InputGroup>
            </PaginationItem>
        </PaginationStyle>
    );
};

export default PaginationControl;
