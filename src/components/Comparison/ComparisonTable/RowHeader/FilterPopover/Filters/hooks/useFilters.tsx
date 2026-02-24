import { uniqBy } from 'lodash';
import { parseAsJson, useQueryState } from 'nuqs';
import { useCallback, useMemo } from 'react';
import z from 'zod';

import { useComparisonState } from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonContextProvider/ComparisonContextProvider';
import { ComparisonFilter, FilterType, FilterValues } from '@/components/Comparison/ComparisonTable/RowHeader/FilterPopover/Filters/types';
import useComparison from '@/components/Comparison/hooks/useComparison';
import { SelectedPathValues, ThingReference } from '@/services/backend/types';

const getValuesByPath = (values: Record<string, SelectedPathValues[]> | undefined, query: { id: string }): ThingReference[] => {
    if (!values) return [];
    const nodes = values[query.id];
    if (!nodes) return [];
    return nodes.flatMap((node) => node.values).filter(Boolean);
};

const EMPTY_FILTER: ComparisonFilter = {};

const useFilters = () => {
    const { comparisonContents } = useComparison();
    const { id: comparisonId } = useComparisonState();
    const filterSchema = z.record(
        z.array(
            z.object({
                id: z.string(),
                path: z.array(z.string()),
                type: z.enum(['number', 'date', 'text', 'category']),
                filterValues: z.object({
                    minValue: z.number().optional(),
                    maxValue: z.number().optional(),
                    startDate: z.string().optional(),
                    endDate: z.string().optional(),
                    values: z.array(z.string()).optional(),
                }),
            }),
        ),
    );
    const [filters, setFilters] = useQueryState(
        'filters',
        parseAsJson<ComparisonFilter>(filterSchema.parse).withDefault(EMPTY_FILTER).withOptions({
            history: 'push',
        }),
    );

    const getUniqueValues = useCallback(
        ({ id }: { id: string; path?: string[] }) => {
            const values = getValuesByPath(comparisonContents?.values, { id });

            const valueCounts = values.reduce<Record<string, number>>((acc, curr) => {
                acc[curr.label] = (acc[curr.label] || 0) + 1;
                return acc;
            }, {});

            return uniqBy(values, 'label')
                .map((v) => ({
                    label: v.label,
                    count: valueCounts[v.label],
                }))
                .sort((a, b) => b.count - a.count);
        },
        [comparisonContents],
    );

    const getType = ({ id, path }: { id: string; path: string[] }) => {
        const uniqueValues = getUniqueValues({ id, path });

        if (uniqueValues.length === 0) {
            return 'text';
        }

        const isNum = () => uniqueValues.length === uniqueValues.filter((value) => !Number.isNaN(Number(value.label))).length;

        const isDate = () =>
            uniqueValues.length ===
            uniqueValues.filter((value) => {
                const { error } = z.string().date().safeParse(value.label);
                return !error;
            }).length;

        const isText = () => {
            // Check if total values are more than 3
            const hasMultipleValues = uniqueValues.length > 3;
            // Check if there are values with more than 6 words
            const hasLongPhrases = uniqueValues.length !== uniqueValues.filter((value) => value.label.split(' ').length < 6).length;
            // Check if majority of values have length (number of items) more than 2
            const valuesWithLongLength = uniqueValues.filter((value) => value.count > 2).length;
            const majorityHasLongLength = valuesWithLongLength / uniqueValues.length < 0.5;
            return hasMultipleValues && hasLongPhrases && majorityHasLongLength;
        };

        let type: FilterType;

        if (isText()) {
            type = 'text';
        } else if (isNum()) {
            type = 'number';
        } else if (isDate()) {
            type = 'date';
        } else {
            type = 'category';
        }
        return type;
    };

    const getFilter = useMemo(
        () =>
            ({ id, path }: { id: string; path?: string[] }) =>
                filters?.[comparisonId]?.find((filter) => filter.id === id && JSON.stringify(filter.path) === JSON.stringify(path)),
        [comparisonId, filters],
    );

    const removeFilter = ({ id, path }: { id: string; path?: string[] }) => {
        setFilters((prev) => ({
            ...prev,
            [comparisonId]: (prev[comparisonId] ?? [])?.filter((f) => !(f.id === id && JSON.stringify(f.path) === JSON.stringify(path))),
        }));
    };

    const resetFilters = () => {
        setFilters((prev) => {
            const { [comparisonId]: _, ...rest } = prev;
            return rest;
        });
    };

    const addFilter = ({ id, path, filterValues, type }: { id: string; path?: string[]; filterValues: FilterValues; type: FilterType }) => {
        setFilters((prev) => ({
            ...prev,
            [comparisonId]: [
                ...(prev[comparisonId] ?? []).filter((f) => !(f.id === id && JSON.stringify(f.path) === JSON.stringify(path))),
                {
                    id,
                    path: path ?? [],
                    type,
                    filterValues,
                },
            ],
        }));
    };

    return { filters, setFilters, getFilter, removeFilter, addFilter, getUniqueValues, getType, resetFilters };
};

export default useFilters;
