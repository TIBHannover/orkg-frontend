'use client';

import { useQueryState } from 'nuqs';
import { createContext, FC, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { computeConversionsForPath } from '@/components/Comparison/ComparisonTable/RowHeader/UnitCalculator/conversionResultsUtils';
import {
    ConversionEntry,
    conversionsMapParser,
    pathKey,
} from '@/components/Comparison/ComparisonTable/RowHeader/UnitCalculator/unitConversionUtils';
import useQudtUnits from '@/components/Comparison/ComparisonTable/RowHeader/UnitCalculator/useQudtUnits';
import { ComparisonContents } from '@/services/backend/types';
import { ConversionResult } from '@/services/qudt/types';

type ConversionsByPath = Record<string, ConversionResult[]>;

const ConversionResultsContext = createContext<{ conversionsByPath: ConversionsByPath }>({ conversionsByPath: {} });

export const useConversionResults = () => useContext(ConversionResultsContext);

export const ConversionResultsProvider: FC<{ comparisonId: string; comparisonContents: ComparisonContents | undefined; children: ReactNode }> = ({
    comparisonId,
    comparisonContents,
    children,
}) => {
    const [conversionsByPath, setConversionsByPath] = useState<ConversionsByPath>({});
    const [conversionsMap] = useQueryState('conversions', conversionsMapParser);
    // The `conversions` URL param is shared by every comparison rendered on the page
    // (e.g. several embedded in one review) — only this comparison's entries apply here.
    const scopedConversions = useMemo(() => conversionsMap.filter((entry) => entry.c === comparisonId), [conversionsMap, comparisonId]);
    const hasConversions = scopedConversions.length > 0;
    const { qudtUnits, isLoading: isLoadingUnits } = useQudtUnits(hasConversions);

    useEffect(() => {
        if (!hasConversions || isLoadingUnits || !qudtUnits.length || !comparisonContents) {
            return undefined;
        }

        let cancelled = false;

        Promise.allSettled(
            scopedConversions.map(async (entry: ConversionEntry) => {
                const results = await computeConversionsForPath(entry.p, entry.t, comparisonContents, qudtUnits);
                return [pathKey(entry.p), results] as const;
            }),
        ).then((settled) => {
            if (cancelled) return;
            const next: ConversionsByPath = {};
            for (const result of settled) {
                if (result.status === 'fulfilled') {
                    const [pathId, results] = result.value;
                    if (results.length > 0) {
                        next[pathId] = results;
                    }
                }
            }
            // Replace rather than merge: the URL entries are the single source of truth,
            // so results of entries removed in the meantime drop out here.
            setConversionsByPath(next);
        });

        return () => {
            cancelled = true;
        };
    }, [hasConversions, isLoadingUnits, qudtUnits, comparisonContents, scopedConversions]);

    // With no entries in the URL there is nothing to apply — expose an empty map without
    // waiting for (or mutating) the computed state.
    const contextValue = useMemo(() => ({ conversionsByPath: hasConversions ? conversionsByPath : {} }), [conversionsByPath, hasConversions]);

    return <ConversionResultsContext.Provider value={contextValue}>{children}</ConversionResultsContext.Provider>;
};
