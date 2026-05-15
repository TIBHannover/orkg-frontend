import { faExpand, faPlus, faSortDown, faSortUp, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, cn, Label, ListBox, Modal, NumberField, Pagination, Select } from '@heroui/react';
import { buttonVariants } from '@heroui/styles';
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

import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import Column from '@/components/DataBrowser/components/Body/ValuePreviewFactory/CSVWTable/Column';
import Header from '@/components/DataBrowser/components/Body/ValuePreviewFactory/CSVWTable/Header';
import { useDataBrowserState } from '@/components/DataBrowser/context/DataBrowserContext';
import useTableData from '@/components/DataBrowser/hooks/useTableData';
import { TableRow } from '@/components/DataBrowser/types/DataBrowserTypes';
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

const PAGE_SIZE_OPTIONS = [5, 10, 20, 30, 40, 50];

type CSVWTableProps = {
    id: string;
};

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
    // eslint-disable-next-line react-hooks/refs
    const shouldSkip = shouldSkipRef.current;

    const skip = useCallback(() => {
        shouldSkipRef.current = false;
    }, []);

    useEffect(() => {
        shouldSkipRef.current = true;
    });

    // eslint-disable-next-line react-hooks/refs
    return [shouldSkip, skip] as const;
}

const CSVWTable: FC<CSVWTableProps> = ({ id }) => {
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

    const toggleModal = () => setIsCSVWModelOpen((v) => !v);

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
        state: { sorting, pagination },
        meta: {
            id,
            updateData: async (rowIndex, columnId, value) => {
                skipAutoResetPageIndex();
                mutateTableCell(rowIndex, columnId, value);
            },
            deleteRow: handleDeleteRowWithLoading,
            deletingRowIndex,
        },
    });

    const pageSizeOptions = useMemo(
        () =>
            PAGE_SIZE_OPTIONS.includes(pagination.pageSize) ? PAGE_SIZE_OPTIONS : [...PAGE_SIZE_OPTIONS, pagination.pageSize].sort((a, b) => a - b),
        [pagination.pageSize],
    );

    const disabledWrapper = (children: ReactElement) => (
        <Modal.Backdrop className="z-[1055]" isOpen={isCSVWModelOpen} onOpenChange={(open) => !open && toggleModal()} isDismissable>
            <Modal.Container size="full">
                <Modal.Dialog>
                    <Modal.Header>
                        <Modal.CloseTrigger />
                        <Modal.Heading>View tabular data: {tableResource?.label}</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>{children}</Modal.Body>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );

    const hasRows = table.getRowModel().rows?.length > 0;

    return (
        <ConditionalWrapper condition={isCSVWModelOpen} wrapper={disabledWrapper}>
            <div className="px-2 py-4 border-b flex flex-wrap items-stretch">
                {!isLoading && (
                    <div className="w-full max-w-full">
                        <div className="mb-4 flex justify-end gap-2">
                            <Button variant="secondary" size="sm" onPress={toggleModal}>
                                <FontAwesomeIcon icon={faExpand} className="mr-1" />
                                {isCSVWModelOpen ? 'Close full screen' : 'Full screen'}
                            </Button>
                            {hasRows && (
                                <CSVLink
                                    headers={cols.map((h) => ({ label: h.label ?? 'No Label', key: h.id }))}
                                    data={data?.map((c) => Object.assign({}, ...Object.keys(c).map((v) => ({ [v]: c[v]?.value ?? '' }))) ?? [])}
                                    filename={`${tableResource?.label || id}.csv`}
                                    className={buttonVariants({ variant: 'secondary', size: 'sm' })}
                                    target="_blank"
                                >
                                    Export as CSV
                                </CSVLink>
                            )}
                        </div>
                        <div className="text-nowrap block overflow-auto pb-4 pe-4 bg-surface">
                            <table className="w-full border-separate border-spacing-0 text-sm [&_th]:border-b [&_th]:border-separator [&_th]:p-2 [&_td]:border-b [&_td]:border-separator [&_td]:p-2 [&_tbody_tr:nth-child(odd)_td]:bg-surface-secondary/50">
                                <thead>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <tr
                                            key={headerGroup.id}
                                            onMouseEnter={() => isEditMode && setHoveredHeader(true)}
                                            onMouseLeave={() => isEditMode && setHoveredHeader(false)}
                                            style={isEditMode && hoveredHeader ? { borderBottom: '1px solid var(--accent)' } : undefined}
                                        >
                                            {headerGroup.headers.map((header, index) => {
                                                const isTitlesColumn = isTitlesColumnsExist && index === 0;
                                                return (
                                                    <th
                                                        key={header.id}
                                                        colSpan={header.colSpan}
                                                        className={cn(
                                                            'relative text-left align-top',
                                                            isTitlesColumn ? 'sticky left-0 z-20 ps-4 !bg-surface-secondary' : 'bg-surface',
                                                        )}
                                                        style={{
                                                            borderRight:
                                                                isEditMode && hoveredColumnIndex === index ? '1px solid var(--accent)' : undefined,
                                                        }}
                                                        onMouseEnter={() => isEditMode && setHoveredColumnIndex(index)}
                                                        onMouseLeave={() => isEditMode && setHoveredColumnIndex(null)}
                                                    >
                                                        {header.isPlaceholder ? null : (
                                                            <button
                                                                type="button"
                                                                className={cn(
                                                                    'inline-flex items-center bg-transparent border-0 p-0 text-inherit font-inherit text-left',
                                                                    header.column.getCanSort() ? 'cursor-pointer select-none' : 'cursor-default',
                                                                    isEditMode ? 'ps-2' : '',
                                                                )}
                                                                onClick={header.column.getToggleSortingHandler()}
                                                            >
                                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                                {{
                                                                    asc: <FontAwesomeIcon icon={faSortUp} className="ms-1" />,
                                                                    desc: <FontAwesomeIcon icon={faSortDown} className="ms-1" />,
                                                                }[header.column.getIsSorted() as string] ?? null}
                                                            </button>
                                                        )}
                                                        {isEditMode && hoveredHeader && index === 0 && (
                                                            <div className="absolute left-0 bottom-0 z-10 translate-y-1/2">
                                                                <ButtonWithLoading
                                                                    variant="primary"
                                                                    className="rounded-full p-0 m-0 inline-flex items-center justify-center w-4 h-4 min-w-0"
                                                                    isLoading={addingRowIndex === pagination.pageIndex * pagination.pageSize}
                                                                    loadingMessage=""
                                                                    onPress={() => {
                                                                        handleAddRowWithLoading(pagination.pageIndex * pagination.pageSize);
                                                                    }}
                                                                    aria-label="Insert row at top"
                                                                >
                                                                    <FontAwesomeIcon icon={faPlus} size="2xs" className="m-0" />
                                                                </ButtonWithLoading>
                                                            </div>
                                                        )}
                                                        {isEditMode && hoveredColumnIndex === index && (
                                                            <div className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-1/2">
                                                                <ButtonWithLoading
                                                                    variant="primary"
                                                                    className="rounded-full p-0 m-0 inline-flex items-center justify-center w-4 h-4 min-w-0"
                                                                    isLoading={(() => {
                                                                        const position = isTitlesColumnsExist ? index : index + 1;
                                                                        return addingColumnIndex === position;
                                                                    })()}
                                                                    loadingMessage=""
                                                                    onPress={() => {
                                                                        const position = isTitlesColumnsExist ? index : index + 1;
                                                                        handleAddColumnWithLoading(position);
                                                                    }}
                                                                    aria-label="Insert column"
                                                                >
                                                                    <FontAwesomeIcon icon={faPlus} size="2xs" className="m-0" />
                                                                </ButtonWithLoading>
                                                            </div>
                                                        )}
                                                    </th>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                    {isEditMode && table.getHeaderGroups()[0]?.headers.length === 0 && (
                                        <tr>
                                            <td colSpan={cols.length} className="text-center">
                                                <ButtonWithLoading
                                                    variant="primary"
                                                    className="rounded-full p-0 m-0 inline-flex items-center justify-center w-4 h-4 min-w-0"
                                                    isLoading={addingColumnIndex === 0}
                                                    loadingMessage=""
                                                    onPress={() => handleAddColumnWithLoading(0)}
                                                    aria-label="Insert column"
                                                >
                                                    <FontAwesomeIcon icon={faPlus} size="2xs" className="m-0" />
                                                </ButtonWithLoading>
                                            </td>
                                        </tr>
                                    )}
                                </thead>
                                <tbody>
                                    {table.getRowModel().rows.map((row) => (
                                        <tr
                                            key={row.id}
                                            onMouseEnter={() => isEditMode && setHoveredRowId(row.id)}
                                            onMouseLeave={() => isEditMode && setHoveredRowId(null)}
                                            style={isEditMode && hoveredRowId === row.id ? { borderBottom: '1px solid var(--accent)' } : undefined}
                                        >
                                            {row.getVisibleCells().map((cell, index) => {
                                                const isTitlesColumn = isTitlesColumnsExist && index === 0;
                                                return (
                                                    <td
                                                        key={cell.id}
                                                        className={cn(
                                                            'relative align-top',
                                                            isTitlesColumn &&
                                                                cn(
                                                                    'sticky left-0 ps-4 !bg-surface-secondary',
                                                                    hoveredRowId === row.id ? 'z-30' : 'z-10',
                                                                ),
                                                        )}
                                                        style={{
                                                            borderRight:
                                                                isEditMode && hoveredColumnIndex === index ? '1px solid var(--accent)' : undefined,
                                                        }}
                                                    >
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                        {isEditMode && hoveredRowId === row.id && index === 0 && (
                                                            <div className="absolute left-0 bottom-0 z-10 translate-y-1/2">
                                                                <ButtonWithLoading
                                                                    variant="primary"
                                                                    className="rounded-full p-0 m-0 inline-flex items-center justify-center w-4 h-4 min-w-0"
                                                                    isLoading={addingRowIndex === Number(row.id) + 1}
                                                                    loadingMessage=""
                                                                    onPress={() => handleAddRowWithLoading(Number(row.id) + 1)}
                                                                    aria-label="Insert row"
                                                                >
                                                                    <FontAwesomeIcon icon={faPlus} size="2xs" className="m-0" />
                                                                </ButtonWithLoading>
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                    {table.getRowModel().rows.length === 0 && (
                                        <tr>
                                            <td colSpan={cols.length} className="text-center py-4">
                                                No rows to show
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {hasRows && (
                            <Pagination size={!isCSVWModelOpen ? 'sm' : 'md'} aria-label="Page navigation" className="mt-2">
                                <Pagination.Content className="flex-wrap gap-y-2">
                                    <Pagination.Item>
                                        <Pagination.Link
                                            className="pagination__link--nav"
                                            aria-label="First page"
                                            onPress={() => table.firstPage()}
                                            isDisabled={!table.getCanPreviousPage()}
                                        >
                                            «
                                        </Pagination.Link>
                                    </Pagination.Item>
                                    <Pagination.Item>
                                        <Pagination.Previous
                                            aria-label="Previous page"
                                            onPress={() => table.previousPage()}
                                            isDisabled={!table.getCanPreviousPage()}
                                        >
                                            <Pagination.PreviousIcon />
                                        </Pagination.Previous>
                                    </Pagination.Item>
                                    <Pagination.Item>
                                        <span className="inline-flex items-center px-3 text-sm text-muted whitespace-nowrap">
                                            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount().toLocaleString()}
                                        </span>
                                    </Pagination.Item>
                                    <Pagination.Item>
                                        <Pagination.Next aria-label="Next page" onPress={() => table.nextPage()} isDisabled={!table.getCanNextPage()}>
                                            <Pagination.NextIcon />
                                        </Pagination.Next>
                                    </Pagination.Item>
                                    <Pagination.Item>
                                        <Pagination.Link
                                            className="pagination__link--nav"
                                            aria-label="Last page"
                                            onPress={() => table.lastPage()}
                                            isDisabled={!table.getCanNextPage()}
                                        >
                                            »
                                        </Pagination.Link>
                                    </Pagination.Item>
                                    <Pagination.Item>
                                        <NumberField
                                            aria-label="Go to page"
                                            minValue={1}
                                            maxValue={table.getPageCount() || 1}
                                            value={table.getState().pagination.pageIndex + 1}
                                            step={1}
                                            onChange={(v) => table.setPageIndex(v - 1)}
                                            className="flex flex-row items-center gap-1.5"
                                        >
                                            <Label className="text-sm whitespace-nowrap">Page</Label>
                                            <NumberField.Group className="[grid-template-columns:28px_1fr_28px]">
                                                <NumberField.DecrementButton className="w-7" />
                                                <NumberField.Input className="w-12 text-center" />
                                                <NumberField.IncrementButton className="w-7" />
                                            </NumberField.Group>
                                        </NumberField>
                                    </Pagination.Item>
                                    <Pagination.Item>
                                        <Select
                                            aria-label="Rows per page"
                                            value={String(pagination.pageSize)}
                                            onChange={(key) => {
                                                table.setPageSize(Number(key));
                                            }}
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
                        )}
                    </div>
                )}
                {isLoading && (
                    <div className="text-center text-accent mt-6 mb-6">
                        <FontAwesomeIcon icon={faSpinner} spin size="5x" />
                        <h2 className="text-xl mt-4">Loading table...</h2>
                    </div>
                )}
            </div>
        </ConditionalWrapper>
    );
};

export default CSVWTable;
