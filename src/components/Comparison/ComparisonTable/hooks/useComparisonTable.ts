import { useMemo } from 'react';

import { useComparisonState } from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonContextProvider/ComparisonContextProvider';
import useFilters from '@/components/Comparison/ComparisonTable/RowHeader/FilterPopover/Filters/hooks/useFilters';
import { Filter } from '@/components/Comparison/ComparisonTable/RowHeader/FilterPopover/Filters/types';
import useComparison from '@/components/Comparison/hooks/useComparison';
import { ComparisonTableColumn, SelectedPathValues } from '@/services/backend/types';

/**
 * Recursively flatten nested SelectedPathValues into a flat map keyed by path ID.
 */
function collectAllValues(values: Record<string, SelectedPathValues[]>): Record<string, SelectedPathValues[]> {
    const result: Record<string, SelectedPathValues[]> = {};

    function flatten(valuesMap: Record<string, SelectedPathValues[]>) {
        for (const [pathId, rows] of Object.entries(valuesMap)) {
            if (!result[pathId]) result[pathId] = [];
            result[pathId].push(...rows);
            for (const row of rows) {
                if (row.children) {
                    flatten(row.children);
                }
            }
        }
    }

    flatten(values);
    return result;
}

/**
 * Checks if a value label matches a filter.
 */
const matchesFilter = (label: string, filter: Filter): boolean => {
    switch (filter.type) {
        case 'category':
            return filter.filterValues.values?.includes(label) ?? false;

        case 'number': {
            const numValue = Number(label);
            const { minValue, maxValue } = filter.filterValues;

            if (minValue !== undefined && maxValue !== undefined) {
                return numValue >= minValue && numValue <= maxValue;
            }
            if (minValue !== undefined) {
                return numValue >= minValue;
            }
            if (maxValue !== undefined) {
                return numValue <= maxValue;
            }
            return false;
        }

        case 'text':
            return filter.filterValues.values?.some((val) => label.toLowerCase().includes(val.toLowerCase())) ?? false;

        case 'date': {
            const dateValue = new Date(label);
            const { startDate, endDate } = filter.filterValues;

            if (startDate !== undefined && endDate !== undefined) {
                return dateValue >= new Date(startDate) && dateValue <= new Date(endDate);
            }
            if (startDate !== undefined) {
                return dateValue >= new Date(startDate);
            }
            if (endDate !== undefined) {
                return dateValue <= new Date(endDate);
            }
            return false;
        }

        default:
            return false;
    }
};

function applyFilters(columnCount: number, values: Record<string, SelectedPathValues[]>, activeFilters: Filter[] | undefined): boolean[] {
    if (!activeFilters || activeFilters.length === 0) {
        return Array(columnCount).fill(true);
    }

    const allValues = collectAllValues(values);
    return Array.from({ length: columnCount }, (_, colIdx) =>
        activeFilters.every((filter) => {
            const pathRows = allValues[filter.id];
            if (!pathRows) return false;
            return pathRows.some((row) => {
                const value = row.values?.[colIdx];
                return value && matchesFilter(value.label, filter);
            });
        }),
    );
}

const useComparisonTable = () => {
    const { comparisonContents } = useComparison();
    const { id } = useComparisonState();
    const { filters, resetFilters } = useFilters();

    const { columns, sourceIds } = useMemo(() => {
        if (!comparisonContents) return { columns: [] as ComparisonTableColumn[], sourceIds: [] as string[] };
        const cols: ComparisonTableColumn[] = comparisonContents.titles.map((title, i) => ({
            title,
            subtitle: comparisonContents.subtitles[i] ?? null,
            values: {},
        }));
        return { columns: cols, sourceIds: cols.map((c) => c.subtitle?.id ?? c.title.id) };
    }, [comparisonContents]);

    const activeColumns = useMemo(
        () => applyFilters(columns.length, comparisonContents?.values ?? {}, filters?.[id]),
        [columns.length, comparisonContents?.values, filters, id],
    );

    const hasData = activeColumns.some(Boolean);

    return { columns, sourceIds, activeColumns, hasData, filters, resetFilters, comparisonContents };
};

export default useComparisonTable;
