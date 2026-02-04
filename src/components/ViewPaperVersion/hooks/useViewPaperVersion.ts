import { uniqBy } from 'lodash';
import useSWR from 'swr';

import useViewPaper from '@/components/ViewPaper/hooks/useViewPaper';
import { CLASSES, PREDICATES } from '@/constants/graphSettings';
import THING_TYPES from '@/constants/thingTypes';
import { getThing, simCompServiceUrl } from '@/services/simcomp';
import { filterSubjectOfStatementsByPredicateAndClass } from '@/utils';

const useViewPaperVersion = ({ paperId }: { paperId: string }) => {
    const { paper, isLoadingPaperVersion } = useViewPaper({ paperId });

    const fetcher = async (pId: string) => {
        const snapshot = await getThing({ thingType: THING_TYPES.PAPER_VERSION, thingKey: pId });
        const contributionsNodes = filterSubjectOfStatementsByPredicateAndClass(
            snapshot.data.statements,
            PREDICATES.HAS_CONTRIBUTION,
            false,
            CLASSES.CONTRIBUTION,
        );
        return { statements: snapshot.data.statements, contributions: uniqBy(contributionsNodes, 'id').reverse() };
    };

    const { data, isLoading, error } = useSWR(paperId ? [paperId, simCompServiceUrl, 'getThing'] : null, ([params]) => fetcher(params));

    if (paper && !isLoadingPaperVersion) {
        document.title = paper?.title;
    }
    return {
        isLoading,
        isLoadingFailed: !!error,
        contributions: data?.contributions,
        paperStatements: data?.statements,
    };
};

export default useViewPaperVersion;
