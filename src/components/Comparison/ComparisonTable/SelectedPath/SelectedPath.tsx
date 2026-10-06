import { FC, Fragment, useMemo, useState } from 'react';

import useColumnWidth from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonHeader/hooks/useColumnWidth';
import useComparisonTable from '@/components/Comparison/ComparisonTable/hooks/useComparisonTable';
import { useConversionResults } from '@/components/Comparison/ComparisonTable/RowHeader/UnitCalculator/ConversionResultsContext';
import {
    findScopedConversions,
    getOriginalUnitMeasurements,
    resolveRowCellValue,
} from '@/components/Comparison/ComparisonTable/SelectedPath/selectedPathUtils';
import ShowMoreButton from '@/components/Comparison/ComparisonTable/ShowMoreButton/ShowMoreButton';
import TableRow from '@/components/Comparison/ComparisonTable/TableRow/TableRow';
import { ComparisonPath, SelectedPathValues, ThingReference } from '@/services/backend/types';

const MAX_ITEMS = 6;

type SelectedPathProps = {
    pathNode: ComparisonPath;
    rows: SelectedPathValues[];
    parentPath?: string[];
    keyPrefix?: string;
    parentHistoryPerColumn?: string[][];
    parentNumericValues?: (ThingReference | null)[];
    parentUnitValues?: (ThingReference | null)[];
};

const SelectedPath: FC<SelectedPathProps> = ({
    pathNode,
    rows,
    parentPath = [],
    keyPrefix = '',
    parentHistoryPerColumn,
    parentNumericValues,
    parentUnitValues,
}) => {
    const { conversionsByPath } = useConversionResults();

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
    const rowKeyOccurrences = new Map<string, number>();

    return (
        <>
            {visibleRows.map((row) => {
                const childHistoryPerColumn = columns.map((column, colIdx) => {
                    const columnId = column.subtitle?.id ?? column.title.id ?? `col-${colIdx}`;
                    const prefix = parentHistoryPerColumn?.[colIdx] ?? [columnId];
                    return [...prefix, pathNode.id, row.values[colIdx]?.id ?? ''];
                });
                const baseRowKey = childHistoryPerColumn.map((history) => history.join('/')).join('|');
                const rowOccurrence = rowKeyOccurrences.get(baseRowKey) ?? 0;
                rowKeyOccurrences.set(baseRowKey, rowOccurrence + 1);
                const rowKey = `${baseRowKey}#${rowOccurrence}`;

                const { numericValues, unitValues, originalUnitMeasurements } = getOriginalUnitMeasurements(pathNode, row);
                const scopedConvertedResults = findScopedConversions(pathNode.id, parentPath, conversionsByPath);
                const resolvedRowValues = row.values.map((cellValue, index) => {
                    return resolveRowCellValue({
                        cellValue,
                        index,
                        pathId: pathNode.id,
                        convertedResults: scopedConvertedResults,
                        parentNumericValues,
                        parentUnitValues,
                    });
                });
                return (
                    <Fragment key={`${treeKey}-${rowKey}`}>
                        <TableRow
                            pathNode={pathNode}
                            path={path}
                            values={row.values}
                            cellValues={resolvedRowValues}
                            originalUnitMeasurements={originalUnitMeasurements}
                            columns={columns}
                            activeColumns={activeColumns}
                            columnWidth={columnWidth}
                            parentHistoryPerColumn={parentHistoryPerColumn}
                        />
                        {pathNode.children.map((child) => (
                            <SelectedPath
                                key={`${treeKey}:${rowKey}/${child.id}`}
                                pathNode={child}
                                rows={row.children?.[child.id] ?? []}
                                parentPath={path}
                                keyPrefix={`${treeKey}:${rowKey}/`}
                                parentHistoryPerColumn={childHistoryPerColumn}
                                parentNumericValues={numericValues}
                                parentUnitValues={unitValues}
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
