import { FC, Fragment, useMemo, useState } from 'react';

import useColumnWidth from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonHeader/hooks/useColumnWidth';
import useComparisonTable from '@/components/Comparison/ComparisonTable/hooks/useComparisonTable';
import ShowMoreButton from '@/components/Comparison/ComparisonTable/ShowMoreButton/ShowMoreButton';
import TableRow from '@/components/Comparison/ComparisonTable/TableRow/TableRow';
import { ComparisonPath, SelectedPathValues } from '@/services/backend/types';

const MAX_ITEMS = 6;

type SelectedPathProps = {
    pathNode: ComparisonPath;
    rows: SelectedPathValues[];
    parentPath?: string[];
    keyPrefix?: string;
    parentHistoryPerColumn?: string[][];
};

const SelectedPath: FC<SelectedPathProps> = ({ pathNode, rows, parentPath = [], keyPrefix = '', parentHistoryPerColumn }) => {
    const { columns, activeColumns } = useComparisonTable();
    const { columnWidth } = useColumnWidth();
    const [isExpanded, setIsExpanded] = useState(false);

    const visibleColumns = useMemo(() => columns.filter((_, i) => activeColumns[i]), [columns, activeColumns]);

    if (rows.length === 0) return null;

    const path = [...parentPath, pathNode.id];
    const treeKey = `${keyPrefix}${pathNode.id}`;
    const shouldShowButton = rows.length > MAX_ITEMS;
    const visibleRows = isExpanded ? rows : rows.slice(0, MAX_ITEMS);
    const hiddenCount = rows.length - MAX_ITEMS;

    return (
        <>
            {visibleRows.map((row, i) => {
                const childHistoryPerColumn = columns.map((column, colIdx) => {
                    const columnId = column.subtitle?.id ?? column.title.id ?? `col-${colIdx}`;
                    const prefix = parentHistoryPerColumn?.[colIdx] ?? [columnId];
                    return [...prefix, pathNode.id, row.values[colIdx]?.id ?? ''];
                });

                return (
                    <Fragment key={`${treeKey}-${i}`}>
                        <TableRow
                            pathNode={pathNode}
                            path={path}
                            values={row.values}
                            columns={columns}
                            activeColumns={activeColumns}
                            columnWidth={columnWidth}
                            parentHistoryPerColumn={parentHistoryPerColumn}
                        />
                        {pathNode.children.map((child) => (
                            <SelectedPath
                                key={`${treeKey}:${i}/${child.id}`}
                                pathNode={child}
                                rows={row.children?.[child.id] ?? []}
                                parentPath={path}
                                keyPrefix={`${treeKey}:${i}/`}
                                parentHistoryPerColumn={childHistoryPerColumn}
                            />
                        ))}
                    </Fragment>
                );
            })}
            {shouldShowButton && (
                <ShowMoreButton
                    hiddenCount={hiddenCount}
                    isExpanded={isExpanded}
                    path={path}
                    propertyLabel={pathNode.label}
                    columns={visibleColumns}
                    columnWidth={columnWidth}
                    onToggle={() => setIsExpanded((prev) => !prev)}
                />
            )}
        </>
    );
};

export default SelectedPath;
