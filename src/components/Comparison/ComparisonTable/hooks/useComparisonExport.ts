import { useMemo } from 'react';

import useComparisonTable from '@/components/Comparison/ComparisonTable/hooks/useComparisonTable';
import { ComparisonPath, SelectedPathValues, ThingReference } from '@/services/backend/types';

export type FlatTableRow = {
    pathId: string;
    path: string[];
    values: (ThingReference | null)[];
};

function buildFlatTable(
    selectedPaths: ComparisonPath[],
    valuesContext: Record<string, SelectedPathValues[]>,
    activeColumns: boolean[],
    parentPath: string[] = [],
): FlatTableRow[] {
    const rows: FlatTableRow[] = [];

    for (const pathNode of selectedPaths) {
        const fullPath = [...parentPath, pathNode.id];
        const pathRows = valuesContext[pathNode.id] ?? [];

        for (const pathRow of pathRows) {
            const values = activeColumns.flatMap((isActive, colIdx) => (isActive ? [pathRow.values?.[colIdx] ?? null] : []));
            rows.push({ pathId: pathNode.id, path: fullPath, values });

            if (pathNode.children.length > 0) {
                rows.push(...buildFlatTable(pathNode.children, pathRow.children ?? {}, activeColumns, fullPath));
            }
        }
    }

    return rows;
}

const useComparisonExport = () => {
    const { columns, activeColumns, comparisonContents } = useComparisonTable();

    const visibleColumns = useMemo(() => columns.filter((_, i) => activeColumns[i]), [columns, activeColumns]);

    const table = useMemo(
        () => (comparisonContents ? buildFlatTable(comparisonContents.selected_paths, comparisonContents.values, activeColumns) : []),
        [comparisonContents, activeColumns],
    );

    return { table, columns: visibleColumns };
};

export default useComparisonExport;
