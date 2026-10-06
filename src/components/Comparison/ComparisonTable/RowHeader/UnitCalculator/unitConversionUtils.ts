import { isEqual } from 'lodash';
import { parseAsJson } from 'nuqs';

import { ThingReference } from '@/services/backend/types';
import { transformUcum } from '@/services/qudt';
import { ConversionResult, QuantityUnitItem } from '@/services/qudt/types';

export type FormattedMeasurement = { value: ThingReference | null; unit: ThingReference | null; ucum?: string };
type ConversionInput = { sourceKey: string; value: string; from: string; to: string };

export type ConversionEntry = { c: string; p: string[]; t: string };

export const conversionsMapParser = parseAsJson<ConversionEntry[]>((value) => {
    if (!Array.isArray(value)) return null;
    return value.every(
        (e) =>
            typeof e === 'object' &&
            e !== null &&
            typeof e.c === 'string' &&
            Array.isArray(e.p) &&
            e.p.every((p: unknown) => typeof p === 'string') &&
            typeof e.t === 'string',
    )
        ? (value as ConversionEntry[])
        : null;
}).withDefault([]);

export const pathKey = (path: string[]) => path.join('/');

const isSameEntry = (entry: ConversionEntry, comparisonId: string, path: string[]) => entry.c === comparisonId && isEqual(entry.p, path);

export const findConversionEntry = (conversions: ConversionEntry[], comparisonId: string, path: string[]): ConversionEntry | undefined =>
    conversions.find((e) => isSameEntry(e, comparisonId, path));

export const upsertConversion = (conversions: ConversionEntry[], comparisonId: string, path: string[], target: string): ConversionEntry[] => [
    ...conversions.filter((e) => !isSameEntry(e, comparisonId, path)),
    { c: comparisonId, p: path, t: target },
];

export const removeConversion = (conversions: ConversionEntry[], comparisonId: string, path: string[]): ConversionEntry[] =>
    conversions.filter((e) => !isSameEntry(e, comparisonId, path));

export const normalizeLabel = (value?: string | null) => value?.toLowerCase().trim() ?? '';

// Identifies a measurement within its path scope. Literal cells can lack an id
// (`literal_ref` without an id), so the key is positional: column index plus the
// source value/unit labels. Rows that collide on all three need the same
// conversion anyway, so a collision is harmless.
export const measurementSourceKey = (index: number, valueLabel?: string | null, unitLabel?: string | null) =>
    `${index}:${normalizeLabel(valueLabel)}:${normalizeLabel(unitLabel)}`;

export const getUnitSuffix = (uri: string) => uri.split('/').pop() ?? uri;

export const buildConversionInputs = (
    measurements: FormattedMeasurement[],
    qudtUnits: QuantityUnitItem[],
    targetUnit: QuantityUnitItem,
): ConversionInput[] =>
    measurements
        .map((measurement, index) => {
            const measurementLabel = normalizeLabel(measurement?.unit?.label);
            const matchedOption = qudtUnits.find((unit) => normalizeLabel(unit.label) === measurementLabel);
            return {
                sourceKey: measurementSourceKey(index, measurement.value?.label, measurement.unit?.label),
                value: measurement.value?.label ?? '',
                from: matchedOption?.ucum ?? '',
                to: targetUnit.ucum ?? '',
            };
        })
        .filter((item): item is ConversionInput => Boolean(item.value && item.from && item.to));

export const executeConversions = async (conversionInputs: ConversionInput[], qudtUnits: QuantityUnitItem[]): Promise<ConversionResult[]> => {
    const toUnitLabel = (ucum?: string | null) => qudtUnits.find((unit) => unit.ucum === ucum)?.label ?? ucum ?? null;

    // A single value the UCUM service rejects (unparsable number, stray text) must not
    // poison the rest of the path — failed conversions are skipped so their cells keep
    // the original value, while the remaining values still convert.
    const settled = await Promise.allSettled(conversionInputs.map((item) => transformUcum({ quantity: item.value, from: item.from, to: item.to })));

    return settled.flatMap((result, index) => {
        if (result.status !== 'fulfilled' || result.value?.ResultQuantity == null) return [];
        const r = result.value as ConversionResult;
        return [
            {
                ...r,
                sourceKey: conversionInputs[index].sourceKey,
                SourceUnit: toUnitLabel(r?.SourceUnit),
                TargetUnit: toUnitLabel(r?.TargetUnit) ?? '',
            },
        ];
    });
};
