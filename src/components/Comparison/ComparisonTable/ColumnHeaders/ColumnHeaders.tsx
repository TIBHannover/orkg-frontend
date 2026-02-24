import { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { useCallback, useEffect } from 'react';

import ColumnHeader, { instanceId, isDragData } from '@/components/Comparison/ComparisonTable/ColumnHeaders/ColumnHeader/ColumnHeader';
import FirstColumnHeader from '@/components/Comparison/ComparisonTable/ColumnHeaders/FirstColumnHeader/FirstColumnHeader';
import useComparison from '@/components/Comparison/hooks/useComparison';
import { createListMonitor, performReorder, ReorderParams } from '@/components/shared/dnd/dragAndDropUtils';
import { ComparisonTableColumn, SelectedPathValues } from '@/services/backend/types';

type ReorderConfig = { startIndex: number; indexOfTarget: number; closestEdgeOfTarget: Edge | null };

function reorderRowColumns(rows: SelectedPathValues[], config: ReorderConfig): SelectedPathValues[] {
    return rows.map((row) => {
        const reorderedChildren: Record<string, SelectedPathValues[]> = {};
        for (const [childPathId, childRows] of Object.entries(row.children)) {
            reorderedChildren[childPathId] = reorderRowColumns(childRows, config);
        }
        return {
            ...row,
            values: performReorder({ items: row.values, ...config, axis: 'horizontal' }),
            children: reorderedChildren,
        };
    });
}

const ColumnHeaders = ({ columns }: { columns?: ComparisonTableColumn[] }) => {
    const { comparison, updateComparison, comparisonContents, mutateComparisonContents } = useComparison();

    const reorderItems = useCallback(
        async ({ startIndex, indexOfTarget, closestEdgeOfTarget }: ReorderParams) => {
            if (!comparison || !comparisonContents) return;

            const config: ReorderConfig = { startIndex, indexOfTarget, closestEdgeOfTarget };

            const reorderedSources = performReorder({
                items: comparison.sources,
                ...config,
                axis: 'horizontal',
            });

            if (reorderedSources !== comparison.sources) {
                updateComparison({
                    sources: reorderedSources,
                });
                const reorderedValues: typeof comparisonContents.values = {};
                for (const [pathId, pathNodes] of Object.entries(comparisonContents.values)) {
                    reorderedValues[pathId] = reorderRowColumns(pathNodes, config);
                }
                const updatedData = {
                    ...comparisonContents,
                    titles: performReorder({ items: comparisonContents.titles, ...config, axis: 'horizontal' }),
                    subtitles: performReorder({ items: comparisonContents.subtitles, ...config, axis: 'horizontal' }),
                    values: reorderedValues,
                };

                mutateComparisonContents(updatedData, {
                    optimisticData: updatedData,
                    revalidate: false, // do not revalidate, otherwise we need to await updateComparison to prevent a race condition
                });
            }
        },
        [comparison, comparisonContents, mutateComparisonContents, updateComparison],
    );

    useEffect(() => {
        const cleanup = createListMonitor<ComparisonTableColumn>({
            instanceId,
            items: columns ?? [],
            isDragData,
            onReorder: reorderItems,
            getItemId: (item) => item?.subtitle?.id ?? item?.title?.id,
        });

        return () => {
            cleanup?.();
        };
    }, [columns, reorderItems]);

    return (
        <tr className="tw:flex tw:items-stretch tw:flex-grow">
            <th
                className="p-0 tw:!sticky tw:left-0 tw:font-medium tw:z-20"
                style={{ boxSizing: 'border-box', flex: ' 2 0 auto', minWidth: 250, width: 2 }}
            >
                <FirstColumnHeader />
            </th>
            {columns?.map((column, index) => (
                <ColumnHeader key={index} index={index} column={column} isLast={index === (columns?.length ?? 0) - 1} />
            ))}
        </tr>
    );
};

export default ColumnHeaders;
