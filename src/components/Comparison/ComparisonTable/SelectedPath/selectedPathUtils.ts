import {
    FormattedMeasurement,
    measurementSourceKey,
    pathKey,
} from '@/components/Comparison/ComparisonTable/RowHeader/UnitCalculator/unitConversionUtils';
import { PREDICATES } from '@/constants/graphSettings';
import { ComparisonPath, SelectedPathValues, ThingReference } from '@/services/backend/types';
import { ConversionResult } from '@/services/qudt/types';

export const findScopedConversions = (
    pathNodeId: string,
    parentPath: string[],
    conversionsByPath: Record<string, ConversionResult[]>,
): ConversionResult[] => {
    const fullPath = [...parentPath, pathNodeId];
    for (let i = fullPath.length; i >= 1; i -= 1) {
        const key = pathKey(fullPath.slice(0, i));
        if (conversionsByPath[key]?.length) return conversionsByPath[key];
    }
    return [];
};

// The unit calculator is only offered for rows shaped by the Quantity Value template
// (R166623): both of its properties — numericValue (P45075) and unit (P45076) — must be
// selected properties of the comparison under this row. Matching is by predicate id only;
// labels are never consulted.
export const isQuantityValueRow = (row: ComparisonPath) =>
    row.children.some((node) => node.id === PREDICATES.QUANTITY_VALUE_NUMERIC_VALUE) &&
    row.children.some((node) => node.id === PREDICATES.QUANTITY_VALUE_UNIT);

export const getOriginalUnitMeasurements = (pathNode: ComparisonPath, row: SelectedPathValues) => {
    const numericValuePath = pathNode.children.find((node) => node.id === PREDICATES.QUANTITY_VALUE_NUMERIC_VALUE);
    const unitPath = pathNode.children.find((node) => node.id === PREDICATES.QUANTITY_VALUE_UNIT);
    const numericValues = numericValuePath ? row.children?.[numericValuePath.id]?.[0]?.values : undefined;
    const unitValues = unitPath ? row.children?.[unitPath.id]?.[0]?.values : undefined;

    const originalUnitMeasurements: FormattedMeasurement[] | undefined = numericValues?.map((val, index) => ({
        value: val,
        unit: unitValues?.[index] ?? null,
    }));

    return { numericValues, unitValues, originalUnitMeasurements };
};

export const resolveRowCellValue = ({
    cellValue,
    index,
    pathId,
    convertedResults,
    parentNumericValues,
    parentUnitValues,
}: {
    cellValue: ThingReference | null;
    index: number;
    pathId: string;
    convertedResults: ConversionResult[];
    parentNumericValues?: (ThingReference | null)[];
    parentUnitValues?: (ThingReference | null)[];
}) => {
    if (!cellValue) {
        return cellValue;
    }
    if (pathId === PREDICATES.QUANTITY_VALUE_NUMERIC_VALUE) {
        const sourceKey = measurementSourceKey(index, cellValue.label, parentUnitValues?.[index]?.label);
        const matchedConversion = convertedResults.find((conversion) => conversion.sourceKey === sourceKey);
        return matchedConversion ? { ...cellValue, label: String(matchedConversion.ResultQuantity ?? '') } : cellValue;
    }
    if (pathId === PREDICATES.QUANTITY_VALUE_UNIT) {
        // The unit label is only rewritten when this column's numeric value was actually
        // converted — a column whose value kept its original unit must keep its unit label.
        const sourceKey = measurementSourceKey(index, parentNumericValues?.[index]?.label, cellValue.label);
        const matchedConversion = parentNumericValues
            ? convertedResults.find((conversion) => conversion.sourceKey === sourceKey)
            : convertedResults[0];
        return matchedConversion?.TargetUnit ? { ...cellValue, label: String(matchedConversion.TargetUnit) } : cellValue;
    }
    return cellValue;
};
