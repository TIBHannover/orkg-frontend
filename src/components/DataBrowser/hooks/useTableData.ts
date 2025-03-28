import { sortBy } from 'lodash';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useDataBrowserState } from '@/components/DataBrowser/context/DataBrowserContext';
import useSnapshotStatement from '@/components/DataBrowser/hooks/useSnapshotStatement';
import { CLASSES, PREDICATES } from '@/constants/graphSettings';
import REGEX from '@/constants/regex';
import { getTable, tablesUrl } from '@/services/backend/tables';
import { Resource, Statement } from '@/services/backend/types';

export type ColType = {
    id: string;
    label: string;
    number?: number;
};

// the id is the column id
export type TableRow = Record<string, { id: string; value: string }>;

const useTableData = ({ id }: { id: string }) => {
    const { isUsingSnapshot } = useSnapshotStatement();
    const { config } = useDataBrowserState();

    const { data: tableData, isLoading: isLoadingTableData } = useSWR(!isUsingSnapshot ? [id, tablesUrl, 'getTable'] : null, ([params]) =>
        getTable(params),
    );

    let _tableStatements: Statement[] = [];
    if (config.statementsSnapshot) {
        _tableStatements = config.statementsSnapshot;
    }

    let tableResource: Resource | null = null;

    let cols: ColType[] = [];
    let lines: {
        id: string;
        label: string;
        number?: number;
        cells: { id: string; value: string }[];
    }[] = [];
    let rows: TableRow[] = [];

    let isTitlesColumnsExist = false;

    // this code block is for backward compatibility with old table data stored in statements (statementsSnapshot)
    if (_tableStatements) {
        const filteredTableStatements = _tableStatements.filter((st) => st.subject.id === id);
        tableResource = filteredTableStatements[0]?.subject ?? null;
        const columnsObjects = filteredTableStatements
            .filter((st) => 'classes' in st.object && st.object.classes.includes(CLASSES.CSVW_COLUMN))
            .map((item) => item.object);
        // Extract columns data
        const columns = columnsObjects.map((column) => {
            const columnsStatements = _tableStatements.filter((st) => column.id === st.subject.id);
            const titlesMatch = columnsStatements.find((st) => st.predicate.id === PREDICATES.CSVW_TITLES);
            const numberMatch = columnsStatements.find((st) => st.predicate.id === PREDICATES.CSVW_NUMBER);
            const titles = titlesMatch ? titlesMatch.object : undefined;
            const number = numberMatch ? numberMatch.object : undefined;
            return { id: column.id, label: titles?.label ?? '', number: parseInt(number?.label ?? '0', 10) };
        });
        // Extract rows data
        const rowsObjects = filteredTableStatements
            .filter((st) => 'classes' in st.object && st.object.classes.includes(CLASSES.CSVW_ROW))
            .map((item) => item.object);
        lines = rowsObjects.map((row) => {
            const rowStatements = _tableStatements.filter((st) => row.id === st.subject.id);
            const titles = rowStatements.filter((st) => st.predicate.id === PREDICATES.CSVW_TITLES).map((st) => st.object)[0] ?? undefined; // single title per row
            const number = rowStatements.filter((st) => st.predicate.id === PREDICATES.CSVW_NUMBER).map((st) => st.object)[0] ?? undefined; // single number per row
            if (titles) {
                isTitlesColumnsExist = true;
            }
            const cellObjects = rowStatements.filter((st) => st.predicate.id === PREDICATES.CSVW_CELLS).map((item) => item.object);
            const cells = cellObjects.map((cell, i) => {
                const valueStatements = _tableStatements.filter((st) => cell.id === st.subject.id && st.predicate.id === PREDICATES.CSVW_VALUE);
                const columnStatements = _tableStatements.filter((st) => cell.id === st.subject.id && st.predicate.id === PREDICATES.CSVW_COLUMN);
                const _value = valueStatements.map((valueSt) => valueSt.object)[0] ?? undefined; // Assuming single value per cell
                const column = columnStatements.map((columnSt) => columnSt.object)[0] ?? columns[i] ?? undefined; // Assuming single value assigned to one column
                return { id: column?.id, value: _value?.label ?? '' };
            });
            return { id: row.id, label: titles?.label ?? '', number: parseInt(number?.label ?? '0', 10), cells };
        });
        // Title column
        if (isTitlesColumnsExist) {
            const findTitleNotRowX = lines.find((r) => !REGEX.CSW_ROW_TITLES_VALUE.test(r.label?.toLowerCase?.() ?? ''));
            if (!findTitleNotRowX) {
                isTitlesColumnsExist = false;
            }
        }
        // Set columns
        cols = isTitlesColumnsExist
            ? [
                  {
                      id: 'titles',
                      label: '',
                      number: undefined,
                  },
                  ...columns,
              ]
            : columns;
        // Sort lines
        lines = sortBy(lines, (obj) => obj.number);
        // Add titles to lines
        lines = lines.map((line) => {
            if (isTitlesColumnsExist) {
                return {
                    ...line,
                    cells: [{ id: 'titles', value: line.label }, ...line.cells],
                };
            }
            return line;
        });
        // Set rows
        for (const line of lines) {
            const _values = Object.assign(
                {},
                ...line.cells.map((c) => ({
                    // c.id is the column id
                    [c.id]: c,
                })),
            );
            rows.push(_values);
        }
    }

    if (tableData && tableData.rows.length > 0) {
        isTitlesColumnsExist = tableData?.rows.some((row) => row.label !== null);
        cols = tableData?.rows[0]?.data?.map((c, i) => ({ id: c.id ?? i.toString(), label: c.label ?? '' })) ?? [];
        rows =
            tableData.rows
                .slice(1)
                .map((r) =>
                    Object.assign(
                        {},
                        ...r.data.map((c, i) => ({ [cols[i].id ?? i]: { id: c.id ?? i.toString(), value: c.label } })),
                        ...(isTitlesColumnsExist ? [{ titles: { id: 'titles', value: r.label } }] : []),
                    ),
                ) ?? [];
        cols = isTitlesColumnsExist ? [{ id: 'titles', label: '', number: undefined }, ...cols] : cols;
    }

    const data = useMemo(() => rows, [lines?.length, rows?.length]);

    return {
        cols,
        data,
        isTitlesColumnsExist,
        tableResource,
        isLoading: isLoadingTableData,
    };
};

export default useTableData;
