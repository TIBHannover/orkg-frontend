import { useCallback, useMemo } from 'react';
import useSWR from 'swr';

import { useDataBrowserState } from '@/components/DataBrowser/context/DataBrowserContext';
import useSnapshotStatement from '@/components/DataBrowser/hooks/useSnapshotStatement';
import { ColType, TableRow } from '@/components/DataBrowser/types/DataBrowserTypes';
import { processTableStatements } from '@/components/DataBrowser/utils/tableUtils';
import { MISC } from '@/constants/graphSettings';
import { createLiteral, getLiteral } from '@/services/backend/literals';
import { createTableColumn, createTableRow, deleteTableRow, getTable, Table, TableCell, tablesUrl, updateRow } from '@/services/backend/tables';
import { Resource, Statement } from '@/services/backend/types';

const useTableData = ({ id, skipAutoResetPageIndex }: { id: string; skipAutoResetPageIndex: () => void }) => {
    const { isUsingSnapshot } = useSnapshotStatement();
    const { config } = useDataBrowserState();

    const {
        data: tableData,
        isLoading: isLoadingTableData,
        mutate: mutateTable,
    } = useSWR(!isUsingSnapshot ? [id, tablesUrl, 'getTable'] : null, ([params]) => getTable(params));

    const { cols, rows, isTitlesColumnsExist, tableResource } = useMemo(() => {
        let _tableStatements: Statement[] = [];
        if (config.statementsSnapshot) {
            _tableStatements = config.statementsSnapshot;
        }

        let _tableResource: Resource | null = null;
        let _cols: ColType[] = [];
        let _rows: TableRow[] = [];
        let _isTitlesColumnsExist = false;

        // this code block is for backward compatibility with old table data stored in statements (statementsSnapshot)
        if (_tableStatements && _tableStatements.length > 0) {
            const result = processTableStatements(_tableStatements, id);
            _tableResource = result.tableResource;
            _cols = result.cols;
            _rows = result.rows;
            _isTitlesColumnsExist = result.isTitlesColumnsExist;
        }

        if (tableData && tableData.rows.length > 0) {
            _isTitlesColumnsExist = tableData?.rows.some((row) => row.label !== null) || !!config.isEditMode;
            _cols = tableData?.rows[0]?.data?.map((c, i) => ({ ...c, id: c?.id ?? i.toString(), label: c?.label ?? '' })) ?? [];
            _rows =
                tableData.rows
                    .slice(1)
                    .map((r) =>
                        Object.assign(
                            {},
                            ...r.data.map((c, i) => ({ [_cols[i]?.id ?? i]: { ...c, value: c?.label ?? '' } })),
                            ...(_isTitlesColumnsExist ? [{ titles: { id: 'titles', value: r.label } }] : []),
                        ),
                    ) ?? [];
            _cols = _isTitlesColumnsExist ? [{ id: 'titles', label: '', number: undefined }, ..._cols] : _cols;
        }
        return { cols: _cols, rows: _rows, isTitlesColumnsExist: _isTitlesColumnsExist, tableResource: _tableResource };
    }, [tableData, config.statementsSnapshot, config.isEditMode, id]);

    const mutateTableCell = useCallback(
        (index: number, columnIndex: number, cell: TableCell | null) => {
            if (!tableData) return;
            const newTableData: Table = {
                ...tableData,
                rows: tableData?.rows.map((row, i) =>
                    i === index
                        ? {
                              ...row,
                              label: columnIndex === -1 ? cell?.label ?? null : row.label,
                              data: row.data.map((c, j) => (j === columnIndex ? cell : c)),
                          }
                        : row,
                ),
            };
            mutateTable(newTableData, { revalidate: false });
        },
        [mutateTable, tableData],
    );

    const handleAddTableRow = useCallback(
        async (index: number) => {
            if (!tableData) return;
            // The data array contains only value columns, not the title column (which is row.label)
            const dataColumnsCount = tableData.rows[0].data.length;
            await createTableRow(id, index + 1, {
                row: {
                    label: null,
                    data: Array(dataColumnsCount).fill(null),
                },
                literals: {},
                resources: {},
                predicates: {},
                lists: {},
                classes: {},
            });
            const newTableData: Table = {
                ...tableData,
                rows: [
                    ...tableData.rows.slice(0, index + 1),
                    { label: null, data: Array(dataColumnsCount).fill(null) },
                    ...tableData.rows.slice(index + 1),
                ],
            };
            mutateTable(newTableData, { revalidate: false });
            skipAutoResetPageIndex?.();
        },
        [id, isTitlesColumnsExist, mutateTable, skipAutoResetPageIndex, tableData],
    );

    const handleDeleteTableRow = useCallback(
        async (index: number) => {
            if (!tableData) return;
            // +1 because the index corresponds to the data row, 0 is the header row
            await deleteTableRow(id, index + 1);
            const newTableData: Table = {
                ...tableData,
                rows: tableData.rows.filter((_, i) => i !== index + 1),
            };
            mutateTable(newTableData, { revalidate: false });
            skipAutoResetPageIndex?.();
        },
        [id, mutateTable, skipAutoResetPageIndex, tableData],
    );

    const handleAddTableColumn = useCallback(
        async (index: number) => {
            if (!tableData) return;
            const literalId = await createLiteral('', MISC.DEFAULT_LITERAL_DATATYPE);
            const newLiteral = await getLiteral(literalId);
            await createTableColumn(id, index, {
                column: [literalId, ...Array(tableData.rows.length - 1).fill(null)],
                literals: {},
                resources: {},
                predicates: {},
                lists: {},
                classes: {},
            });
            const newTableData: Table = {
                ...tableData,
                rows: tableData.rows.map((row, i) => ({
                    ...row,
                    data: [...row.data.slice(0, index), i === 0 ? newLiteral : null, ...row.data.slice(index)],
                })),
            };
            mutateTable(newTableData, { revalidate: false });
            skipAutoResetPageIndex?.();
        },
        [id, mutateTable, skipAutoResetPageIndex, tableData],
    );

    const handleUpdateTableHeader = useCallback(
        async (index: number, value: string) => {
            if (!tableData) return;
            // Create a literal with the new value and datatype, then use its ID
            let literalId: string | null = null;
            let newLiteral = null;
            if (value && value.trim()) {
                try {
                    literalId = await createLiteral(value.trim(), MISC.DEFAULT_LITERAL_DATATYPE);
                    newLiteral = await getLiteral(literalId);
                } catch (error) {
                    // Failed to create literal, exit without updating
                    return;
                }
            }
            await updateRow(id, 0, {
                resources: {},
                literals: {},
                predicates: {},
                lists: {},
                classes: {},
                row: { label: null, data: tableData.rows[0].data.map((cell, i) => (i === index ? literalId : cell?.id ?? null)) },
            });
            const newTableData: Table = {
                ...tableData,
                rows: tableData.rows.map((row, i) =>
                    i === 0 ? { ...row, data: row.data.map((cell, j) => (j === index ? newLiteral : cell)) } : row,
                ),
            };
            mutateTable(newTableData, { revalidate: false });
            skipAutoResetPageIndex?.();
        },
        [id, mutateTable, skipAutoResetPageIndex, tableData],
    );

    return {
        cols,
        data: rows,
        isTitlesColumnsExist,
        tableResource,
        isLoading: isLoadingTableData,
        mutateTableCell,
        handleAddTableRow,
        handleDeleteTableRow,
        handleAddTableColumn,
        handleUpdateTableHeader,
    };
};

export default useTableData;
