import {
    buildConversionInputs,
    conversionsMapParser,
    executeConversions,
    FormattedMeasurement,
    measurementSourceKey,
} from '@/components/Comparison/ComparisonTable/RowHeader/UnitCalculator/unitConversionUtils';
import { LiteralThingReference, ResourceThingReference } from '@/services/backend/types';
import { transformUcum } from '@/services/qudt';
import { QuantityUnitItem } from '@/services/qudt/types';

vi.mock('@/services/qudt', () => ({
    transformUcum: vi.fn(),
}));

const UNITS: QuantityUnitItem[] = [
    { quantityKindLabel: 'Length', id: 'http://qudt.org/vocab/unit/M', label: 'Metre', ucum: 'm' },
    { quantityKindLabel: 'Length', id: 'http://qudt.org/vocab/unit/FT', label: 'Foot', ucum: '[ft_i]' },
];
const [, FOOT] = UNITS;

const literal = (label: string): LiteralThingReference => ({ _class: 'literal_ref', label, datatype: 'xsd:decimal' });
const unitResource = (label: string): ResourceThingReference => ({ _class: 'resource_ref', id: `R-${label}`, label, classes: [] });
const measurement = (value: string, unitLabel: string | null): FormattedMeasurement => ({
    value: literal(value),
    unit: unitLabel === null ? null : unitResource(unitLabel),
});

it('conversionsMapParser accepts only well-formed {c, p, t} entry arrays', () => {
    const valid = [{ c: 'R175109', p: ['P26002', 'P45073'], t: 'CentiM' }];
    expect(conversionsMapParser.parse(JSON.stringify(valid))).toEqual(valid);
    expect(conversionsMapParser.parse(JSON.stringify({ c: 'R1', p: ['P1'], t: 'M' }))).toBeNull(); // not an array
    expect(conversionsMapParser.parse(JSON.stringify([{ c: 'R1', p: [1], t: 'M' }]))).toBeNull(); // non-string path segment
    expect(conversionsMapParser.parse(JSON.stringify([{ c: 'R1', p: ['P1'] }]))).toBeNull(); // missing target
    expect(conversionsMapParser.parse('not-json')).toBeNull();
});

it('skips unconvertible values while keeping results aligned to their original columns', async () => {
    const inputs = buildConversionInputs(
        [
            measurement('0.28', 'Metre'), // convertible — UCUM call succeeds
            measurement('85', 'Furlongs per fortnight'), // unit unknown to QUDT — skipped before UCUM
            measurement('0.30', 'Metre'), // convertible — UCUM call fails
            measurement('0.53', 'Metre'), // convertible — UCUM call succeeds
        ],
        UNITS,
        FOOT,
    );
    // the skipped column must not shift the keys of later columns
    expect(inputs.map((i) => i.sourceKey)).toEqual([
        measurementSourceKey(0, '0.28', 'Metre'),
        measurementSourceKey(2, '0.30', 'Metre'),
        measurementSourceKey(3, '0.53', 'Metre'),
    ]);

    vi.mocked(transformUcum)
        .mockResolvedValueOnce({ ResultQuantity: '0.92', TargetUnit: '[ft_i]', SourceUnit: 'm', SourceQuantity: '0.28' })
        .mockRejectedValueOnce(new Error('UCUM service request failed: 400'))
        .mockResolvedValueOnce({ ResultQuantity: '1.74', TargetUnit: '[ft_i]', SourceUnit: 'm', SourceQuantity: '0.53' });
    const results = await executeConversions(inputs, UNITS);

    // the failed conversion is dropped, the survivors stay tied to their own columns
    expect(results.map((r) => [r.sourceKey, r.ResultQuantity, r.TargetUnit])).toEqual([
        [measurementSourceKey(0, '0.28', 'Metre'), '0.92', 'Foot'],
        [measurementSourceKey(3, '0.53', 'Metre'), '1.74', 'Foot'],
    ]);
});
