import ky from 'ky';

import { ConversionResult, QuantityUnitItem } from '@/services/qudt/types';

const QUDT_SPARQL_ENDPOINT = 'https://www.qudt.org/fuseki/qudt/query';
const UCUM_SERVICE_BASE = 'https://ucum.nlm.nih.gov/ucum-service/v1/ucumtransform';
const CACHE_TTL_MS = 60 * 60 * 1000;

type QudtBinding = {
    quantityKindLabel?: { value?: string };
    unitLabel?: { value?: string };
    ucumCode?: { value?: string };
    applicableUnit?: { value?: string };
};

const QUDT_SPARQL_QUERY = `
PREFIX qudt: <http://qudt.org/schema/qudt/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT DISTINCT ?quantityKindLabel ?unitLabel ?ucumCode ?applicableUnit
WHERE {
  ?quantityKind a qudt:QuantityKind ;
                rdfs:label ?quantityKindLabel .

  FILTER(lang(?quantityKindLabel) = "en")

  ?quantityKind qudt:applicableUnit ?applicableUnit .
  ?applicableUnit rdfs:label ?unitLabel .

  FILTER(lang(?unitLabel) = "en" || lang(?unitLabel) = "en-US")

  OPTIONAL { ?applicableUnit qudt:ucumCode ?ucumCode }
}
ORDER BY ?quantityKindLabel ?unitLabel
`;

// -- In-memory cache --

let cachedUnits: QuantityUnitItem[] | null = null;
let cachedAt = 0;
let inFlightPromise: Promise<QuantityUnitItem[]> | null = null;

// UCUM transforms are deterministic, so identical (quantity, from, to) requests can be
// served from memory — conversions stored in shared URLs are recomputed on every visit,
// which would otherwise re-hit the UCUM service once per measurement.
const UCUM_CACHE_MAX_ENTRIES = 500;
const ucumCache = new Map<string, { value: ConversionResult; at: number }>();

export class UcumConversionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'UcumConversionError';
    }
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

export const parseUcumTransformResponse = (payload: unknown): ConversionResult => {
    if (!isRecord(payload)) {
        throw new Error('UCUM service returned an invalid response');
    }

    const wrappedResponse = isRecord(payload.UCUMWebServiceResponse) ? payload.UCUMWebServiceResponse.Response : undefined;
    const response = wrappedResponse ?? payload.Response ?? payload;

    if (typeof response === 'string') {
        throw new UcumConversionError(response.replace(/^ERROR:\s*/i, ''));
    }
    if (!isRecord(response) || response.ResultQuantity == null || typeof response.TargetUnit !== 'string') {
        throw new Error('UCUM service returned an invalid conversion result');
    }

    return {
        TargetUnit: response.TargetUnit,
        ResultQuantity: String(response.ResultQuantity),
        SourceUnit: response.SourceUnit == null ? null : String(response.SourceUnit),
        SourceQuantity: response.SourceQuantity == null ? null : String(response.SourceQuantity),
        error: null,
    };
};

// -- Exported functions --

export async function fetchQudtUnitsFromSparql(): Promise<QuantityUnitItem[]> {
    const body = new URLSearchParams({ query: QUDT_SPARQL_QUERY });

    const response = await ky
        .post(QUDT_SPARQL_ENDPOINT, {
            headers: { Accept: 'application/sparql-results+json' },
            body,
        })
        .json<{ results?: { bindings?: QudtBinding[] } }>();

    return (response?.results?.bindings ?? [])
        .map((b) => ({
            quantityKindLabel: b.quantityKindLabel?.value ?? '',
            id: b.applicableUnit?.value ?? '',
            label: b.unitLabel?.value ?? '',
            ucum: b.ucumCode?.value ?? null,
        }))
        .filter((u) => !!(u.id && u.label && u.ucum));
}

export async function fetchQudtUnitsCached(): Promise<QuantityUnitItem[]> {
    const now = Date.now();
    if (cachedUnits && now - cachedAt < CACHE_TTL_MS) {
        return cachedUnits;
    }

    if (!inFlightPromise) {
        inFlightPromise = fetchQudtUnitsFromSparql()
            .then((units) => {
                cachedUnits = units;
                cachedAt = Date.now();
                return units;
            })
            .finally(() => {
                inFlightPromise = null;
            });
    }

    return inFlightPromise;
}

export async function fetchUcumTransform({ quantity, from, to }: { quantity: string; from: string; to: string }): Promise<ConversionResult> {
    const cacheKey = `${quantity}|${from}|${to}`;
    const cached = ucumCache.get(cacheKey);
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
        return cached.value;
    }

    const url = `${UCUM_SERVICE_BASE}/${encodeURIComponent(quantity)}/from/${encodeURIComponent(from)}/to/${encodeURIComponent(to)}`;
    const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
    });
    if (!response.ok) {
        throw new Error(`UCUM service request failed: ${response.status}`);
    }
    const data = parseUcumTransformResponse(await response.json());

    if (ucumCache.size >= UCUM_CACHE_MAX_ENTRIES) {
        const oldestKey = ucumCache.keys().next().value;
        if (oldestKey !== undefined) ucumCache.delete(oldestKey);
    }
    ucumCache.set(cacheKey, { value: data, at: Date.now() });

    return data;
}
