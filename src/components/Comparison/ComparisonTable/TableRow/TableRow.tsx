import { motion } from 'motion/react';
import { FC } from 'react';

import Cell from '@/components/Comparison/ComparisonTable/Cell/Cell';
import RowHeader from '@/components/Comparison/ComparisonTable/RowHeader/RowHeader';
import { ComparisonPath, ComparisonTableColumn, ThingReference } from '@/services/backend/types';

type TableRowProps = {
    pathNode: ComparisonPath;
    path: string[];
    values: (ThingReference | null)[];
    columns: ComparisonTableColumn[];
    activeColumns: boolean[];
    columnWidth: number;
    parentHistoryPerColumn?: string[][];
};

const TableRow: FC<TableRowProps> = ({ pathNode, path, values, columns, activeColumns, columnWidth, parentHistoryPerColumn }) => {
    return (
        <motion.tr
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="p-0 flex items-stretch flex-grow min-w-fit"
        >
            <RowHeader row={pathNode} path={path} />
            {columns.map((column, colIdx) => {
                if (!activeColumns[colIdx]) return null;
                const value = values[colIdx];
                const columnId = column.subtitle?.id ?? column.title.id ?? `col-${colIdx}`;
                const historyPrefix = parentHistoryPerColumn?.[colIdx] ?? [columnId];
                return (
                    <td
                        key={`${pathNode.id}-${columnId}`}
                        style={{ minWidth: `${columnWidth}px` }}
                        className="p-0 bg-inherit w-[2px] grow-[2] shrink-0 basis-auto"
                    >
                        <Cell
                            value={value ?? undefined}
                            path={path}
                            // no prefix for empty cells — a ''-terminated path must never enter entry
                            // matching. Literal values may have a null id but still need the path so the
                            // AI-review subject/predicate stay derivable; literals render no HistoryLink,
                            // so their '' terminal never reaches entry matching.
                            dataBrowserHistory={value ? [...historyPrefix, pathNode.id, value.id ?? ''] : undefined}
                        />
                    </td>
                );
            })}
        </motion.tr>
    );
};

export default TableRow;
