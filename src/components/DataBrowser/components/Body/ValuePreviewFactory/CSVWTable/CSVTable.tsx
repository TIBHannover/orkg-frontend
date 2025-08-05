import { faExpand, faSortDown, faSortUp, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    PaginationState,
    SortingFn,
    SortingState,
    useReactTable,
} from '@tanstack/react-table';
import { FC, ReactElement, useMemo, useState } from 'react';
import { CSVLink } from 'react-csv';

import useTableData, { TableRow } from '@/components/DataBrowser/hooks/useTableData';
import Button from '@/components/Ui/Button/Button';
import ButtonGroup from '@/components/Ui/Button/ButtonGroup';
import Input from '@/components/Ui/Input/Input';
import InputGroup from '@/components/Ui/Input/InputGroup';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';
import Pagination from '@/components/Ui/Pagination/Pagination';
import PaginationItem from '@/components/Ui/Pagination/PaginationItem';
import PaginationLink from '@/components/Ui/Pagination/PaginationLink';
import Table from '@/components/Ui/Table/Table';
import ConditionalWrapper from '@/components/Utils/ConditionalWrapper';
import { sortMethod } from '@/utils';

const sortColumnFn: SortingFn<TableRow> = (rowA, rowB, _columnId) => sortMethod(rowA.original[_columnId].value, rowB.original[_columnId].value);

type CSVWTableProps = {
    id: string;
};

const CSVWTable: FC<CSVWTableProps> = ({ id }) => {
    const { cols, data, isTitlesColumnsExist, tableResource, isLoading } = useTableData({
        id,
    });

    const [sorting, setSorting] = useState<SortingState>([]);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 5,
    });

    const [isCSVWModelOpen, setIsCSVWModelOpen] = useState(false);

    const toggleModal = () => {
        setIsCSVWModelOpen((v) => !v);
    };

    const columns: ColumnDef<TableRow, { id: string; value: string }>[] = useMemo<ColumnDef<TableRow, { id: string; value: string }>[]>(
        () =>
            cols?.map((c, index) => ({
                header: c.label ?? '',
                accessorKey: c.id,
                sortingFn: sortColumnFn,
                enableFilters: isTitlesColumnsExist && index === 0,
                enableSorting: !(isTitlesColumnsExist && index === 0),
                // eslint-disable-next-line react/no-unstable-nested-components
                cell: (info) => (
                    <span>
                        {info.getValue?.()?.value ?? <b>{info.getValue?.()?.value}</b> ?? (
                            <small>
                                <i>N/A</i>
                            </small>
                        )}
                    </span>
                ),
            })) ?? [],
        [cols, isTitlesColumnsExist],
    );

    const table = useReactTable({
        columns,
        data,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onPaginationChange: setPagination,
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        state: {
            sorting,
            pagination,
        },
    });

    const disabledWrapper = (children: ReactElement) => (
        <Modal fade={false} fullscreen isOpen={isCSVWModelOpen} toggle={toggleModal} size="lg">
            <ModalHeader toggle={toggleModal}>View tabular data: {tableResource?.label}</ModalHeader>
            <ModalBody>{children} </ModalBody>
        </Modal>
    );

    return (
        <ConditionalWrapper condition={isCSVWModelOpen} wrapper={disabledWrapper}>
            <div className="px-2 py-3 br-bottom row g-0">
                {!isLoading && (
                    <div>
                        <div className="d-flex justify-content-end">
                            <ButtonGroup className="mb-3" size="sm">
                                <Button style={{ marginRight: '2px' }} size="sm" onClick={toggleModal}>
                                    <FontAwesomeIcon icon={faExpand} className="me-1" /> {isCSVWModelOpen ? 'Close full screen' : 'Full screen'}
                                </Button>
                                {table.getRowModel().rows?.length > 0 && (
                                    <CSVLink
                                        headers={cols.map((h) => ({
                                            label: h.label ?? 'No Label',
                                            key: h.id,
                                        }))}
                                        data={data?.map((c) => Object.assign({}, ...Object.keys(c).map((v) => ({ [v]: c[v]?.value ?? '' }))) ?? [])}
                                        filename={`${tableResource?.label}.csv`}
                                        className="btn btn-secondary"
                                        target="_blank"
                                    >
                                        Export as CSV
                                    </CSVLink>
                                )}
                            </ButtonGroup>
                        </div>
                        <div className="text-nowrap d-block overflow-auto" style={{ backgroundColor: '#fff' }}>
                            <Table striped bordered hover className="mb-0">
                                <thead>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => {
                                                return (
                                                    <th key={header.id} colSpan={header.colSpan}>
                                                        {header.isPlaceholder ? null : (
                                                            // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                                                            <div
                                                                className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
                                                                onClick={header.column.getToggleSortingHandler()}
                                                            >
                                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                                {{
                                                                    asc: <FontAwesomeIcon icon={faSortUp} className="ms-1" />,
                                                                    desc: <FontAwesomeIcon icon={faSortDown} className="ms-1" />,
                                                                }[header.column.getIsSorted() as string] ?? null}
                                                            </div>
                                                        )}
                                                    </th>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody>
                                    {table.getRowModel().rows.map((row) => {
                                        return (
                                            <tr key={row.id}>
                                                {row.getVisibleCells().map((cell) => {
                                                    return <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>;
                                                })}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </div>
                        <div className="mt-2 ">
                            <Pagination size={!isCSVWModelOpen ? 'sm' : 'md'} aria-label="Page navigation" className="float-start">
                                <PaginationItem title="First page" onClick={() => table.firstPage()} disabled={!table.getCanPreviousPage()}>
                                    <PaginationLink first />
                                </PaginationItem>
                                <PaginationItem title="Previous page" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                                    <PaginationLink previous />
                                </PaginationItem>
                                <PaginationItem active title="Current page">
                                    <PaginationLink>
                                        {table.getState().pagination.pageIndex + 1} of {table.getPageCount().toLocaleString()}
                                    </PaginationLink>
                                </PaginationItem>

                                <PaginationItem
                                    title="Next page"
                                    onClick={() => table.getCanNextPage() && table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                >
                                    <PaginationLink next />
                                </PaginationItem>
                                <PaginationItem
                                    title="Last page"
                                    onClick={() => table.getCanNextPage() && table.lastPage()}
                                    disabled={!table.getCanNextPage()}
                                >
                                    <PaginationLink last />
                                </PaginationItem>
                            </Pagination>
                            <div className="row">
                                <InputGroup size={!isCSVWModelOpen ? 'sm' : 'md'}>
                                    <span className="input-group-text">Page</span>
                                    <Input
                                        type="number"
                                        min="1"
                                        max={table.getPageCount()}
                                        defaultValue={table.getState().pagination.pageIndex + 1}
                                        onChange={(e) => {
                                            const page = e.target.value ? Number(e.target.value) - 1 : 0;
                                            table.setPageIndex(page);
                                        }}
                                    />
                                    <Input
                                        className="d-inline-block"
                                        type="select"
                                        name="selectMulti"
                                        value={table.getState().pagination.pageSize}
                                        onChange={(e) => {
                                            table.setPageSize(Number(e.target.value));
                                        }}
                                    >
                                        {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                                            <option key={pageSize} value={pageSize}>
                                                Show {pageSize}
                                            </option>
                                        ))}
                                    </Input>
                                </InputGroup>
                            </div>
                        </div>
                    </div>
                )}
                {isLoading && (
                    <div className="text-center text-primary mt-4 mb-4">
                        <FontAwesomeIcon icon={faSpinner} spin size="5x" />
                        <h2 className="h5 mt-3">Loading table...</h2>
                    </div>
                )}
            </div>
        </ConditionalWrapper>
    );
};

export default CSVWTable;
