import { useMemo } from 'react';
import useSWR from 'swr';

import useComparison from '@/components/Comparison/hooks/useComparison';
import { getStatements, statementsUrl } from '@/services/backend/statements';
import { Statement } from '@/services/backend/types';

// Fetches the direct statements of each comparison source (contribution). The AI flag lives on
// the statements themselves, so the lookup is built from them and Cell decides per value whether
// to show the review icon.
export const fetchSourceStatements = async (sourceIds: string[]): Promise<Statement[]> => {
    const perSource = await Promise.all(
        sourceIds.map(async (sourceId) => {
            try {
                return await getStatements({ subjectId: sourceId });
            } catch {
                return [] as Statement[];
            }
        }),
    );
    return perSource.flat();
};

// Derives the comparison source ids and fetches their statements via SWR. The SWR key is shared
// across all consumers (the AI review provider and the publish flow), so they reuse a single
// request instead of each triggering their own. Only runs in edit mode, so view-mode visitors
// never trigger requests.
const useSourceStatements = (comparisonId?: string) => {
    const { comparisonContents, isEditMode } = useComparison(comparisonId);

    const sourceIds = useMemo(
        () => (comparisonContents ? comparisonContents.titles.map((title, i) => comparisonContents.subtitles[i]?.id ?? title.id) : []),
        [comparisonContents],
    );

    const { data: statements, mutate } = useSWR(
        isEditMode && sourceIds.length > 0 ? [comparisonId, sourceIds.join(','), statementsUrl, 'getSourceStatements'] : null,
        () => fetchSourceStatements(sourceIds),
    );

    return { statements, sourceIds, mutate, comparisonContents, isEditMode };
};

export default useSourceStatements;
