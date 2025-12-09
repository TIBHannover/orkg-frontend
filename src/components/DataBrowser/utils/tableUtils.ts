import { sortBy } from 'lodash';

import { ColType, TableRow } from '@/components/DataBrowser/types/DataBrowserTypes';
import { CLASSES, PREDICATES } from '@/constants/graphSettings';
import REGEX from '@/constants/regex';
import { Resource, Statement } from '@/services/backend/types';

type ProcessTableStatementsResult = {
    tableResource: Resource | null;
    cols: ColType[];
    rows: TableRow[];
    isTitlesColumnsExist: boolean;
};

/**
 * Processes table statements for backward compatibility with old table data stored in statements (statementsSnapshot)
 */
export const processTableStatements = (_tableStatements: Statement[], id: string): ProcessTableStatementsResult => {
    let tableResource: Resource | null = null;
    let cols: ColType[] = [];
    let lines: {
        id: string;
        label: string;
        number?: number;
        cells: { id: string; value: string }[];
    }[] = [];
    const rows: TableRow[] = [];
    let isTitlesColumnsExist = false;

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

    return {
        tableResource,
        cols,
        rows,
        isTitlesColumnsExist,
    };
};

export default processTableStatements;
