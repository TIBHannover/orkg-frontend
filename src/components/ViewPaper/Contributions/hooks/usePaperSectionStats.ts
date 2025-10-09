import useSWR from 'swr';

import { getPaper, papersUrl } from '@/services/backend/papers';
import { getRSStatements, rosettaStoneUrl } from '@/services/backend/rosettaStone';

const usePaperSectionStats = ({ paperId }: { paperId: string }) => {
    const {
        data: paper,
        isLoading: isPaperLoading,
        mutate: mutatePaper,
    } = useSWR(paperId ? [paperId, papersUrl, 'getPaper'] : null, ([params]) => getPaper(params));
    const {
        data: statements,
        isLoading: isStatementsLoading,
        mutate: mutateStatements,
    } = useSWR(paperId ? [{ context: paperId, size: 1, page: 0 }, rosettaStoneUrl, 'getRSStatements'] : null, ([params]) => getRSStatements(params));

    return {
        count: {
            contributions: paper?.contributions.length,
            mentions: paper?.mentionings.length,
            statements: statements?.page.total_elements,
        },
        isLoading: isPaperLoading || isStatementsLoading,
        mutatePaper,
        mutateStatements,
    };
};

export default usePaperSectionStats;
