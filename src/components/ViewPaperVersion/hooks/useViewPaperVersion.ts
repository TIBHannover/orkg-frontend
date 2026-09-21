import { uniqBy } from 'lodash';
import useSWR from 'swr';

import { CLASSES } from '@/constants/graphSettings';
import { getPublishedContents, papersUrl } from '@/services/backend/papers';
import { Resource } from '@/services/backend/types';

const useViewPaperVersion = ({ paperId }: { paperId: string }) => {
    const { data, isLoading, error } = useSWR(paperId ? [paperId, papersUrl, 'getPublishedContents'] : null, ([params]) =>
        getPublishedContents(params),
    );

    const contributions = uniqBy(
        data?.statements
            ?.filter((statement) => statement.subject._class === 'resource' && statement.subject.classes.includes(CLASSES.CONTRIBUTION))
            .map((statement) => ({
                // the filter above guarantees the subject is a resource
                ...(statement.subject as Resource),
                statementId: statement.id,
            })) ?? [],
        'id',
    ).reverse();

    return {
        isLoading,
        isLoadingFailed: !!error,
        contributions,
        paperStatements: data?.statements ?? [],
    };
};

export default useViewPaperVersion;
