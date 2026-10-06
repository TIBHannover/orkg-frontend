import { measurementSourceKey } from '@/components/Comparison/ComparisonTable/RowHeader/UnitCalculator/unitConversionUtils';
import { isQuantityValueRow, resolveRowCellValue } from '@/components/Comparison/ComparisonTable/SelectedPath/selectedPathUtils';
import { PREDICATES } from '@/constants/graphSettings';
import { ComparisonPath, LiteralThingReference, ResourceThingReference } from '@/services/backend/types';
import { ConversionResult } from '@/services/qudt/types';

const NUMERIC_VALUE = PREDICATES.QUANTITY_VALUE_NUMERIC_VALUE;
const UNIT = PREDICATES.QUANTITY_VALUE_UNIT;

const pathNode = (id: string, label: string, children: ComparisonPath[] = []): ComparisonPath => ({
    id,
    label,
    type: 'PREDICATE',
    children,
});

const literal = (label: string): LiteralThingReference => ({ _class: 'literal_ref', label, datatype: 'xsd:decimal' });
const unitResource = (label: string): ResourceThingReference => ({ _class: 'resource_ref', id: `R-${label}`, label, classes: [] });

it('gates by the Quantity Value template property ids, never by labels', () => {
    // both P45075 and P45076 selected → active, labels are irrelevant
    expect(isQuantityValueRow(pathNode('P45073', 'x', [pathNode(NUMERIC_VALUE, 'whatever'), pathNode(UNIT, 'whatever')]))).toBe(true);
    // one of the two is not enough
    expect(isQuantityValueRow(pathNode('P45073', 'x', [pathNode(NUMERIC_VALUE, 'numericValue')]))).toBe(false);
    // user-created lookalike properties with the right labels but other ids never activate
    expect(isQuantityValueRow(pathNode('P45073', 'quantityValue', [pathNode('P999998', 'numericValue'), pathNode('P999999', 'unit')]))).toBe(false);
});

it('rewrites the numeric value and unit only for the column that actually converted', () => {
    const parentNumericValues = [literal('0.28'), literal('0.30')];
    const parentUnitValues = [unitResource('Metre'), unitResource('Metre')];
    // only column 0 converted
    const convertedResults: ConversionResult[] = [
        {
            sourceKey: measurementSourceKey(0, '0.28', 'Metre'),
            TargetUnit: 'Foot',
            ResultQuantity: '0.92',
            SourceUnit: 'Metre',
            SourceQuantity: '0.28',
        },
    ];
    const resolve = (cellValue: LiteralThingReference | ResourceThingReference, index: number, pathId: string) =>
        resolveRowCellValue({ cellValue, index, pathId, convertedResults, parentNumericValues, parentUnitValues });

    // numeric cells match positionally: column 0 rewritten, column 1 untouched
    expect(resolve(literal('0.28'), 0, NUMERIC_VALUE)).toEqual({ ...literal('0.28'), label: '0.92' });
    expect(resolve(literal('0.30'), 1, NUMERIC_VALUE)).toEqual(literal('0.30'));
    // unit cells follow their column's numeric value: rewritten where it converted, kept where it did not
    expect(resolve(unitResource('Metre'), 0, UNIT)).toEqual({ ...unitResource('Metre'), label: 'Foot' });
    expect(resolve(unitResource('Metre'), 1, UNIT)).toEqual(unitResource('Metre'));
    // rows other than the two template properties pass through untouched
    expect(resolve(literal('0.28'), 0, 'P45073')).toEqual(literal('0.28'));
});
