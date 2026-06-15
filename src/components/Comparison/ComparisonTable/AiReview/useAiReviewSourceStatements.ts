import { useMemo } from 'react';

import { loadIncorrectStatementIds } from '@/components/Comparison/ComparisonTable/AiReview/incorrectStatementsStorage';
import useSourceStatements from '@/components/Comparison/ComparisonTable/AiReview/useSourceStatements';
import { EXTRACTION_METHODS } from '@/constants/misc';
import { Statement } from '@/services/backend/types';

type UseAiReviewSourceStatements = {
    statements?: Statement[];
    // Statements still showing the exclamation mark: AI-generated and not yet accepted or rejected.
    unverifiedCount: number;
    // Ids of source statements the user rejected (present in the comparison and stored locally).
    rejectedStatementIds: string[];
};

// Shares the same SWR key as ComparisonAiReviewProvider, so consumers outside the table (e.g. the
// publish flow) reuse the already-fetched source statements instead of triggering another request.
const useAiReviewSourceStatements = (comparisonId?: string): UseAiReviewSourceStatements => {
    const { statements } = useSourceStatements(comparisonId);

    const { unverifiedCount, rejectedStatementIds } = useMemo(() => {
        if (!comparisonId) {
            return { unverifiedCount: 0, rejectedStatementIds: [] as string[] };
        }
        const incorrect = new Set(loadIncorrectStatementIds(comparisonId));
        const list = statements ?? [];
        return {
            unverifiedCount: list.filter(
                (statement) => statement.extraction_method === EXTRACTION_METHODS.AI_GENERATED && !incorrect.has(statement.id),
            ).length,
            rejectedStatementIds: list.filter((statement) => incorrect.has(statement.id)).map((statement) => statement.id),
        };
    }, [statements, comparisonId]);

    return { statements, unverifiedCount, rejectedStatementIds };
};

export default useAiReviewSourceStatements;
