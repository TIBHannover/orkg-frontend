import {
    buildConversionInputs,
    executeConversions,
    getUnitSuffix,
} from '@/components/Comparison/ComparisonTable/RowHeader/UnitCalculator/unitConversionUtils';
import { getOriginalUnitMeasurements } from '@/components/Comparison/ComparisonTable/SelectedPath/selectedPathUtils';
import { ComparisonContents, ComparisonPath, SelectedPathValues } from '@/services/backend/types';
import { ConversionResult, QuantityUnitItem } from '@/services/qudt/types';

export const findNodeAtPath = (path: string[], nodes: ComparisonPath[]): ComparisonPath | null => {
    let currentNodes = nodes;
    let currentNode: ComparisonPath | undefined;

    for (const pathId of path) {
        currentNode = currentNodes.find((node) => node.id === pathId);
        if (!currentNode) {
            return null;
        }
        currentNodes = currentNode.children;
    }

    return currentNode ?? null;
};

export const collectRowsAtPath = (path: string[], comparisonContents: ComparisonContents): SelectedPathValues[] => {
    if (path.length === 0) return [];

    const [rootId, ...rest] = path;
    let currentRows = comparisonContents.values[rootId] ?? [];
    for (const childId of rest) {
        currentRows = currentRows.flatMap((row) => row.children?.[childId] ?? []);
    }
    return currentRows;
};

export const computeConversionsForPath = async (
    path: string[],
    targetUnitId: string,
    comparisonContents: ComparisonContents,
    qudtUnits: QuantityUnitItem[],
): Promise<ConversionResult[]> => {
    const targetUnit = qudtUnits.find((unit) => getUnitSuffix(unit.id) === targetUnitId);
    if (!targetUnit?.ucum) return [];

    const pathNode = findNodeAtPath(path, comparisonContents.selectedPaths);
    if (!pathNode) return [];

    const conversionInputs = collectRowsAtPath(path, comparisonContents).flatMap((row) => {
        const { originalUnitMeasurements } = getOriginalUnitMeasurements(pathNode, row);
        // Indexes identify columns within a row, so build each row independently instead
        // of flattening rows into one global index sequence.
        return buildConversionInputs(originalUnitMeasurements ?? [], qudtUnits, targetUnit);
    });

    if (!conversionInputs.length) return [];

    return executeConversions(conversionInputs, qudtUnits);
};
