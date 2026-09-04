import { type ReorderEvent, reorderList, useAutoScroll, useSortableList } from '@orkg/pragmatic-dnd-hooks';
import { type RefObject, useEffect } from 'react';

import ColumnHeader from '@/components/Comparison/ComparisonTable/ColumnHeaders/ColumnHeader/ColumnHeader';
import FirstColumnHeader from '@/components/Comparison/ComparisonTable/ColumnHeaders/FirstColumnHeader/FirstColumnHeader';
import useComparison from '@/components/Comparison/hooks/useComparison';
import { ComparisonTableColumn, SelectedPathValues } from '@/services/backend/types';

function reorderRowColumns(rows: SelectedPathValues[], event: ReorderEvent): SelectedPathValues[] {
    return rows.map((row) => {
        const reorderedChildren: Record<string, SelectedPathValues[]> = {};
        for (const [childPathId, childRows] of Object.entries(row.children)) {
            reorderedChildren[childPathId] = reorderRowColumns(childRows, event);
        }
        return {
            ...row,
            values: reorderList(row.values, event),
            children: reorderedChildren,
        };
    });
}

type ColumnHeadersProps = {
    columns?: ComparisonTableColumn[];
    /** The scrolling `<thead>` this row lives in — dragging a column near its edges scrolls it. */
    scrollContainer: RefObject<HTMLTableSectionElement | null>;
};

const ColumnHeaders = ({ columns, scrollContainer }: ColumnHeadersProps) => {
    const { comparison, updateComparison, comparisonContents, mutateComparisonContents } = useComparison();

    const { instanceId } = useSortableList({
        itemCount: columns?.length ?? 0,
        axis: 'horizontal',
        onReorder: (event) => {
            if (!comparison || !comparisonContents) return;

            updateComparison({
                sources: reorderList(comparison.sources, event),
            });
            const reorderedValues: typeof comparisonContents.values = {};
            for (const [pathId, pathNodes] of Object.entries(comparisonContents.values)) {
                reorderedValues[pathId] = reorderRowColumns(pathNodes, event);
            }
            const updatedData = {
                ...comparisonContents,
                titles: reorderList(comparisonContents.titles, event),
                subtitles: reorderList(comparisonContents.subtitles, event),
                values: reorderedValues,
            };

            mutateComparisonContents(updatedData, {
                optimisticData: updatedData,
                revalidate: false, // do not revalidate, otherwise we need to await updateComparison to prevent a race condition
            });
        },
    });

    const { scrollContainerRef } = useAutoScroll({ instanceId });
    // the scrollable element is the <thead> owned by ComparisonTable, not a node this row renders
    useEffect(() => {
        scrollContainerRef(scrollContainer.current);
    }, [scrollContainerRef, scrollContainer]);

    return (
        <tr className="flex items-stretch flex-grow">
            <th
                className="p-0 sticky left-0 font-medium z-20 bg-surface"
                style={{ boxSizing: 'border-box', flex: ' 2 0 auto', minWidth: 250, width: 2 }}
            >
                <FirstColumnHeader />
            </th>
            {columns?.map((column, index) => (
                <ColumnHeader key={index} index={index} column={column} instanceId={instanceId} isLast={index === (columns?.length ?? 0) - 1} />
            ))}
        </tr>
    );
};

export default ColumnHeaders;
