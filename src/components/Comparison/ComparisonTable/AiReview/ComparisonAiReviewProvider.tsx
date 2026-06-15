'use client';

import { createContext, FC, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { loadIncorrectStatementIds, saveIncorrectStatementIds } from '@/components/Comparison/ComparisonTable/AiReview/incorrectStatementsStorage';
import useSourceStatements from '@/components/Comparison/ComparisonTable/AiReview/useSourceStatements';
import { EXTRACTION_METHODS } from '@/constants/misc';
import errorHandler from '@/helpers/errorHandler';
import { updateStatement } from '@/services/backend/statements';
import { ExtractionMethod, Statement } from '@/services/backend/types';

export type CellStatement = {
    statementId: string;
    extractionMethod: ExtractionMethod;
};

type AiReviewContextValue = {
    getCellStatement: (subjectId: string, predicateId: string, objectId: string | null, objectLabel: string) => CellStatement | undefined;
    isAiSource: (sourceId: string) => boolean;
    setExtractionMethod: (statementId: string, method: ExtractionMethod) => Promise<void>;
    acceptAll: () => Promise<void>;
    isIncorrect: (statementId: string) => boolean;
    markIncorrect: (statementId: string) => void;
    unmarkIncorrect: (statementId: string) => void;
    pendingCount: number;
    totalCount: number;
};

const AiReviewContext = createContext<AiReviewContextValue>({
    getCellStatement: () => undefined,
    isAiSource: () => false,
    setExtractionMethod: async () => {},
    acceptAll: async () => {},
    isIncorrect: () => false,
    markIncorrect: () => {},
    unmarkIncorrect: () => {},
    pendingCount: 0,
    totalCount: 0,
});

export const useComparisonAiReview = () => useContext(AiReviewContext);

const idKey = (subjectId: string, predicateId: string, objectId: string) => `${subjectId}|${predicateId}|id::${objectId}`;
// Comparison contents return literal cells with a null id, so we also index by object label to be
// able to match those cells back to their statement.
const labelKey = (subjectId: string, predicateId: string, objectLabel: string) => `${subjectId}|${predicateId}|label::${objectLabel}`;

type ComparisonAiReviewProviderProps = {
    comparisonId: string;
    children: ReactNode;
};

const ComparisonAiReviewProvider: FC<ComparisonAiReviewProviderProps> = ({ comparisonId, children }) => {
    const { statements, mutate, comparisonContents } = useSourceStatements(comparisonId);

    // re-fetch the source statements whenever the comparison contents change (e.g. after changing data in the data browser)
    useEffect(() => {
        if (comparisonContents) {
            mutate();
        }
    }, [comparisonContents, mutate]);

    const lookup = useMemo(() => {
        const map = new Map<string, CellStatement>();
        for (const statement of statements ?? []) {
            const entry: CellStatement = { statementId: statement.id, extractionMethod: statement.extraction_method };
            map.set(idKey(statement.subject.id, statement.predicate.id, statement.object.id), entry);
            map.set(labelKey(statement.subject.id, statement.predicate.id, statement.object.label), entry);
        }
        return map;
    }, [statements]);

    const getCellStatement = useCallback(
        (subjectId: string, predicateId: string, objectId: string | null, objectLabel: string) =>
            (objectId ? lookup.get(idKey(subjectId, predicateId, objectId)) : undefined) ?? lookup.get(labelKey(subjectId, predicateId, objectLabel)),
        [lookup],
    );

    // source ids whose source resource was AI-generated
    const aiSourceIds = useMemo(() => {
        const ids = new Set<string>();
        for (const statement of statements ?? []) {
            if (statement.subject.extraction_method === EXTRACTION_METHODS.AI_GENERATED) {
                ids.add(statement.subject.id);
            }
        }
        return ids;
    }, [statements]);

    const isAiSource = useCallback((sourceId: string) => aiSourceIds.has(sourceId), [aiSourceIds]);

    // Optimistically sets the extraction method of the given statements, rolling back on error.
    const applyExtractionMethod = useCallback(
        async (statementIds: string[], method: ExtractionMethod) => {
            if (statementIds.length === 0) {
                return;
            }
            const ids = new Set(statementIds);
            try {
                await mutate(
                    async () => {
                        await Promise.all([...ids].map((id) => updateStatement(id, { extraction_method: method })));
                        return undefined;
                    },
                    {
                        optimisticData: (current?: Statement[]) =>
                            (current ?? []).map((statement) => (ids.has(statement.id) ? { ...statement, extraction_method: method } : statement)),
                        populateCache: false,
                        revalidate: false,
                        rollbackOnError: true,
                    },
                );
            } catch (error: unknown) {
                errorHandler({ error, shouldShowToast: true });
            }
        },
        [mutate],
    );

    const setExtractionMethod = useCallback(
        (statementId: string, method: ExtractionMethod) => applyExtractionMethod([statementId], method),
        [applyExtractionMethod],
    );

    const [incorrectIds, setIncorrectIds] = useState<Set<string>>(() => new Set(loadIncorrectStatementIds(comparisonId)));

    const isIncorrect = useCallback((statementId: string) => incorrectIds.has(statementId), [incorrectIds]);

    const setIncorrect = useCallback(
        (statementId: string, incorrect: boolean) => {
            setIncorrectIds((prev) => {
                if (prev.has(statementId) === incorrect) {
                    return prev;
                }
                const next = new Set(prev);
                if (incorrect) {
                    next.add(statementId);
                } else {
                    next.delete(statementId);
                }
                saveIncorrectStatementIds(comparisonId, [...next]);
                return next;
            });
        },
        [comparisonId],
    );

    const markIncorrect = useCallback((statementId: string) => setIncorrect(statementId, true), [setIncorrect]);

    const unmarkIncorrect = useCallback((statementId: string) => setIncorrect(statementId, false), [setIncorrect]);

    const { pendingCount, totalCount } = useMemo(() => {
        let pending = 0;
        let total = 0;
        for (const statement of statements ?? []) {
            if (statement.extraction_method === EXTRACTION_METHODS.AI_GENERATED) {
                pending += 1;
                total += 1;
            } else if (statement.extraction_method === EXTRACTION_METHODS.AI_GENERATED_WITH_MANUAL_REVIEW) {
                total += 1;
            }
        }
        return { pendingCount: pending, totalCount: total };
    }, [statements]);

    const acceptAll = useCallback(() => {
        const pendingIds = (statements ?? [])
            .filter((statement) => statement.extraction_method === EXTRACTION_METHODS.AI_GENERATED)
            .map((statement) => statement.id);
        return applyExtractionMethod(pendingIds, EXTRACTION_METHODS.AI_GENERATED_WITH_MANUAL_REVIEW);
    }, [statements, applyExtractionMethod]);

    const value = useMemo(
        () => ({
            getCellStatement,
            isAiSource,
            setExtractionMethod,
            acceptAll,
            isIncorrect,
            markIncorrect,
            unmarkIncorrect,
            pendingCount,
            totalCount,
        }),
        [getCellStatement, isAiSource, setExtractionMethod, acceptAll, isIncorrect, markIncorrect, unmarkIncorrect, pendingCount, totalCount],
    );

    return <AiReviewContext.Provider value={value}>{children}</AiReviewContext.Provider>;
};

export default ComparisonAiReviewProvider;
