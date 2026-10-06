import { computeConversionsForPath, findNodeAtPath } from '@/components/Comparison/ComparisonTable/RowHeader/UnitCalculator/conversionResultsUtils';
import { measurementSourceKey } from '@/components/Comparison/ComparisonTable/RowHeader/UnitCalculator/unitConversionUtils';
import { PREDICATES } from '@/constants/graphSettings';
import { ComparisonContents, ComparisonPath, LiteralThingReference, ResourceThingReference, SelectedPathValues } from '@/services/backend/types';
import { transformUcum } from '@/services/qudt';
import { QuantityUnitItem } from '@/services/qudt/types';

vi.mock('@/services/qudt', () => ({
    transformUcum: vi.fn(),
}));

const { QUANTITY_VALUE, QUANTITY_VALUE_NUMERIC_VALUE: NUMERIC_VALUE, QUANTITY_VALUE_UNIT: UNIT } = PREDICATES;

const UNITS: QuantityUnitItem[] = [
    { quantityKindLabel: 'Length', id: 'http://qudt.org/vocab/unit/M', label: 'Metre', ucum: 'm' },
    { quantityKindLabel: 'Length', id: 'http://qudt.org/vocab/unit/FT', label: 'Foot', ucum: '[ft_i]' },
];

const pathNode = (id: string, label: string, children: ComparisonPath[] = []): ComparisonPath => ({
    id,
    label,
    type: 'PREDICATE',
    children,
});

const literal = (label: string): LiteralThingReference => ({ _class: 'literal_ref', label, datatype: 'xsd:decimal' });
const resource = (id: string, label = id): ResourceThingReference => ({ _class: 'resource_ref', id, label, classes: [] });

const quantityRow = (quantity: string): SelectedPathValues => ({
    values: [resource(`R-${quantity}`)],
    children: {
        [NUMERIC_VALUE]: [{ values: [literal(quantity)], children: {} }],
        [UNIT]: [{ values: [resource('R-Metre', 'Metre')], children: {} }],
    },
});

const parentRow = (quantities: string[]): SelectedPathValues => ({
    values: [resource(`R-${quantities.join('-')}`)],
    children: {
        [QUANTITY_VALUE]: quantities.map(quantityRow),
    },
});

it('resolves the exact full path and resets conversion indexes for every repeated row', async () => {
    const quantityPathA = pathNode(QUANTITY_VALUE, 'Quantity A', [pathNode(NUMERIC_VALUE, 'Numeric value'), pathNode(UNIT, 'Unit')]);
    const quantityPathB = pathNode(QUANTITY_VALUE, 'Quantity B', [pathNode(NUMERIC_VALUE, 'Numeric value'), pathNode(UNIT, 'Unit')]);
    const comparisonContents: ComparisonContents = {
        selectedPaths: [pathNode('P-A', 'Parent A', [quantityPathA]), pathNode('P-B', 'Parent B', [quantityPathB])],
        titles: [],
        subtitles: [],
        values: {
            'P-A': [parentRow(['1'])],
            'P-B': [parentRow(['3', '4'])],
        },
    };

    expect(findNodeAtPath(['P-B', QUANTITY_VALUE], comparisonContents.selectedPaths)).toBe(quantityPathB);

    vi.mocked(transformUcum).mockImplementation(async ({ quantity, from, to }) => ({
        ResultQuantity: `${quantity}-converted`,
        TargetUnit: to,
        SourceUnit: from,
        SourceQuantity: quantity,
    }));

    const results = await computeConversionsForPath(['P-B', QUANTITY_VALUE], 'FT', comparisonContents, UNITS);

    expect(vi.mocked(transformUcum).mock.calls.map(([input]) => input.quantity)).toEqual(['3', '4']);
    expect(results.map((result) => result.sourceKey)).toEqual([measurementSourceKey(0, '3', 'Metre'), measurementSourceKey(0, '4', 'Metre')]);
});
