import { faExpand, faPlus, faSortDown, faSortUp, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    PaginationState,
    RowData,
    SortingFn,
    SortingState,
    useReactTable,
} from '@tanstack/react-table';
import { FC, ReactElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CSVLink } from 'react-csv';
import { useTheme } from 'styled-components';

import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import Column from '@/components/DataBrowser/components/Body/ValuePreviewFactory/CSVWTable/Column';
import Header from '@/components/DataBrowser/components/Body/ValuePreviewFactory/CSVWTable/Header';
import { useDataBrowserState } from '@/components/DataBrowser/context/DataBrowserContext';
import useTableData from '@/components/DataBrowser/hooks/useTableData';
import { TableRow } from '@/components/DataBrowser/types/DataBrowserTypes';
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
import { TableCell } from '@/services/backend/tables';
import { sortMethod } from '@/utils';

declare module '@tanstack/react-table' {
    interface TableMeta<TData extends RowData> {
        id: string;
        updateData: (rowIndex: number, columnId: number, value: TableCell) => void;
        deleteRow: (rowIndex: number) => Promise<void>;
        deletingRowIndex: number | null;
    }
}
const sortColumnFn: SortingFn<TableRow> = (rowA, rowB, _columnId) => sortMethod(rowA.original[_columnId].value, rowB.original[_columnId].value);

type CSVWTableProps = {
    id: string;
};

// Create a stable header renderer function
const createHeaderRenderer = (
    column: { id: string; label: string; number?: number },
    index: number,
    tableID: string,
    handleUpdateTableHeader: (i: number, value: string) => void,
) => {
    const HeaderRenderer = () => <Header column={column} index={index} tableID={tableID} handleUpdateTableHeader={handleUpdateTableHeader} />;
    HeaderRenderer.displayName = `HeaderRenderer-${column.id}`;
    return HeaderRenderer;
};

function useSkipper() {
    const shouldSkipRef = useRef(true);
    const shouldSkip = shouldSkipRef.current;

    // Wrap a function with this to skip a pagination reset temporarily
    const skip = useCallback(() => {
        shouldSkipRef.current = false;
    }, []);

    useEffect(() => {
        shouldSkipRef.current = true;
    });

    return [shouldSkip, skip] as const;
}

const CSVWTable: FC<CSVWTableProps> = ({ id }) => {
    const theme = useTheme();
    const borderColor = theme.primary;
    const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();
    const {
        cols,
        data,
        isTitlesColumnsExist,
        tableResource,
        isLoading,
        mutateTableCell,
        handleAddTableRow,
        handleDeleteTableRow,
        handleAddTableColumn,
        handleUpdateTableHeader,
    } = useTableData({
        id,
        skipAutoResetPageIndex,
    });

    const { config } = useDataBrowserState();
    const { isEditMode } = config;
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 5,
    });

    const [isCSVWModelOpen, setIsCSVWModelOpen] = useState(false);

    const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
    const [hoveredHeader, setHoveredHeader] = useState(false);
    const [hoveredColumnIndex, setHoveredColumnIndex] = useState<number | null>(null);
    const [addingRowIndex, setAddingRowIndex] = useState<number | null>(null);
    const [deletingRowIndex, setDeletingRowIndex] = useState<number | null>(null);
    const [addingColumnIndex, setAddingColumnIndex] = useState<number | null>(null);

    const toggleModal = () => {
        setIsCSVWModelOpen((v) => !v);
    };

    const handleAddRowWithLoading = async (index: number) => {
        setAddingRowIndex(index);
        try {
            await handleAddTableRow(index);
        } finally {
            setAddingRowIndex(null);
        }
    };

    const handleDeleteRowWithLoading = async (index: number) => {
        setDeletingRowIndex(index);
        try {
            await handleDeleteTableRow(index);
        } finally {
            setDeletingRowIndex(null);
        }
    };

    const handleAddColumnWithLoading = async (index: number) => {
        setAddingColumnIndex(index);
        try {
            await handleAddTableColumn(index);
        } finally {
            setAddingColumnIndex(null);
        }
    };

    const columns: ColumnDef<TableRow, { id: string; value: string }>[] = useMemo<ColumnDef<TableRow, { id: string; value: string }>[]>(
        () =>
            cols?.map((c, index) => ({
                header: createHeaderRenderer(c, isTitlesColumnsExist ? index - 1 : index, id, handleUpdateTableHeader),
                accessorKey: c.id,
                sortingFn: sortColumnFn,
                enableFilters: !isEditMode && isTitlesColumnsExist && index === 0,
                enableSorting: !isEditMode && !(isTitlesColumnsExist && index === 0),
            })) ?? [],
        [cols, isTitlesColumnsExist, isEditMode, id, handleUpdateTableHeader],
    );

    const table = useReactTable({
        columns,
        data,
        defaultColumn: Column,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onPaginationChange: setPagination,
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        autoResetPageIndex,
        state: {
            sorting,
            pagination,
        }, // Provide our updateData function to our table meta
        meta: {
            id,
            updateData: async (rowIndex, columnId, value) => {
                // Skip page index reset until after next rerender
                skipAutoResetPageIndex();
                mutateTableCell(rowIndex, columnId, value);
            },
            deleteRow: handleDeleteRowWithLoading,
            deletingRowIndex,
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
                    <div className="tw:w-full tw:max-w-full">
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
                        <div className="text-nowrap d-block overflow-auto tw:pb-4 tw:pe-4" style={{ backgroundColor: theme.lightLighter }}>
                            <Table striped bordered hover className="mb-0">
                                <thead>
                                    {table.getHeaderGroups().map((headerGroup) => {
                                        const headerStyle = isEditMode && hoveredHeader ? { borderBottom: `1px solid ${borderColor}` } : undefined;
                                        return (
                                            <tr
                                                key={headerGroup.id}
                                                onMouseEnter={() => isEditMode && setHoveredHeader(true)}
                                                onMouseLeave={() => isEditMode && setHoveredHeader(false)}
                                                style={headerStyle}
                                            >
                                                {headerGroup.headers.map((header, index) => {
                                                    const isTitlesColumn = isTitlesColumnsExist && index === 0;
                                                    return (
                                                        <th
                                                            key={header.id}
                                                            colSpan={header.colSpan}
                                                            className={`tw:relative ${isTitlesColumn ? 'tw:sticky tw:left-0 tw:z-20 tw:ps-4' : ''}`}
                                                            style={{
                                                                backgroundColor: isTitlesColumn ? '#f0f0f0' : '#fff',
                                                                borderRight:
                                                                    isEditMode && hoveredColumnIndex === index
                                                                        ? `1px solid ${borderColor}`
                                                                        : undefined,
                                                            }}
                                                            onMouseEnter={() => isEditMode && setHoveredColumnIndex(index)}
                                                            onMouseLeave={() => isEditMode && setHoveredColumnIndex(null)}
                                                        >
                                                            {header.isPlaceholder ? null : (
                                                                // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                                                                <div
                                                                    className={`tw:inline-flex tw:items-center ${
                                                                        header.column.getCanSort() ? 'tw:cursor-pointer tw:select-none' : ''
                                                                    } ${isEditMode ? 'tw:!ps-2' : ''}`}
                                                                    onClick={header.column.getToggleSortingHandler()}
                                                                >
                                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                                    {{
                                                                        asc: <FontAwesomeIcon icon={faSortUp} className="tw:ms-1" />,
                                                                        desc: <FontAwesomeIcon icon={faSortDown} className="tw:ms-1" />,
                                                                    }[header.column.getIsSorted() as string] ?? null}
                                                                </div>
                                                            )}
                                                            {isEditMode && hoveredHeader && index === 0 && (
                                                                <div className="tw:!absolute tw:!left-0 tw:!bottom-0 tw:!z-10 tw:!translate-y-1/2">
                                                                    <ButtonWithLoading
                                                                        color="primary"
                                                                        size="xs"
                                                                        className="tw:!rounded-full tw:!p-0 tw:!m-0 tw:!inline-flex tw:!items-center tw:!justify-center tw:!w-4 tw:!h-4"
                                                                        isLoading={addingRowIndex === pagination.pageIndex * pagination.pageSize}
                                                                        loadingMessage=""
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleAddRowWithLoading(pagination.pageIndex * pagination.pageSize);
                                                                        }}
                                                                        title="Insert row at top"
                                                                    >
                                                                        <FontAwesomeIcon icon={faPlus} size="2xs" className="tw:!m-0" />
                                                                    </ButtonWithLoading>
                                                                </div>
                                                            )}
                                                            {isEditMode && hoveredColumnIndex === index && (
                                                                <div className="tw:!absolute tw:!right-0 tw:!top-1/2 tw:!z-10 tw:!-translate-y-1/2 tw:!translate-x-1/2">
                                                                    <ButtonWithLoading
                                                                        color="primary"
                                                                        size="xs"
                                                                        className="tw:!rounded-full tw:!p-0 tw:!m-0 tw:!inline-flex tw:!items-center tw:!justify-center tw:!w-4 tw:!h-4"
                                                                        isLoading={(() => {
                                                                            const position = isTitlesColumnsExist ? index : index + 1;
                                                                            return addingColumnIndex === position;
                                                                        })()}
                                                                        loadingMessage=""
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            // Calculate the position after this column
                                                                            // If titles exist, subtract 1 from index for the position
                                                                            const position = isTitlesColumnsExist ? index : index + 1;
                                                                            handleAddColumnWithLoading(position);
                                                                        }}
                                                                        title="Insert column"
                                                                    >
                                                                        <FontAwesomeIcon icon={faPlus} size="2xs" className="tw:!m-0" />
                                                                    </ButtonWithLoading>
                                                                </div>
                                                            )}
                                                        </th>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    })}
                                    {isEditMode && table.getHeaderGroups()[0]?.headers.length === 0 && (
                                        <tr>
                                            <td colSpan={cols.length} className="text-center">
                                                <ButtonWithLoading
                                                    color="primary"
                                                    size="xs"
                                                    className="tw:!rounded-full tw:!p-0 tw:!m-0 tw:!inline-flex tw:!items-center tw:!justify-center tw:!w-4 tw:!h-4"
                                                    isLoading={addingColumnIndex === 0}
                                                    loadingMessage=""
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAddColumnWithLoading(0);
                                                    }}
                                                    title="Insert column"
                                                >
                                                    <FontAwesomeIcon icon={faPlus} size="2xs" className="tw:!m-0" />
                                                </ButtonWithLoading>
                                            </td>
                                        </tr>
                                    )}
                                </thead>
                                <tbody>
                                    {table.getRowModel().rows.map((row) => {
                                        const rowStyle =
                                            isEditMode && hoveredRowId === row.id ? { borderBottom: `1px solid ${borderColor}` } : undefined;
                                        return (
                                            <tr
                                                key={row.id}
                                                onMouseEnter={() => isEditMode && setHoveredRowId(row.id)}
                                                onMouseLeave={() => isEditMode && setHoveredRowId(null)}
                                                style={rowStyle}
                                            >
                                                {row.getVisibleCells().map((cell, index) => {
                                                    const isTitlesColumn = isTitlesColumnsExist && index === 0;
                                                    return (
                                                        <td
                                                            key={cell.id}
                                                            className={`tw:relative ${
                                                                isTitlesColumn
                                                                    ? `tw:sticky tw:left-0 ${hoveredRowId === row.id ? 'tw:z-30' : 'tw:z-10'} tw:ps-4`
                                                                    : ''
                                                            }`}
                                                            style={{
                                                                backgroundColor: isTitlesColumn ? '#f0f0f0' : '#fff',
                                                                borderRight:
                                                                    isEditMode && hoveredColumnIndex === index
                                                                        ? `1px solid ${borderColor}`
                                                                        : undefined,
                                                            }}
                                                        >
                                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                            {isEditMode && hoveredRowId === row.id && index === 0 && (
                                                                <div className="tw:!absolute tw:!left-0 tw:!bottom-0 tw:!z-10 tw:!translate-y-1/2">
                                                                    <ButtonWithLoading
                                                                        color="primary"
                                                                        size="xs"
                                                                        className="tw:!rounded-full tw:!p-0 tw:!m-0 tw:!inline-flex tw:!items-center tw:!justify-center tw:!w-4 tw:!h-4"
                                                                        isLoading={addingRowIndex === Number(row.id) + 1}
                                                                        loadingMessage=""
                                                                        onClick={() => handleAddRowWithLoading(Number(row.id) + 1)}
                                                                        title="Insert row"
                                                                    >
                                                                        <FontAwesomeIcon icon={faPlus} size="2xs" className="tw:!m-0" />
                                                                    </ButtonWithLoading>
                                                                </div>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    })}
                                    {table.getRowModel().rows.length === 0 && (
                                        <tr>
                                            <td colSpan={cols.length} className="text-center tw:!py-4">
                                                No rows to show
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>
                        {table.getRowModel().rows.length > 0 && (
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
                        )}
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
