import { uniqBy } from 'lodash';
import useSWR from 'swr';

import { CLASSES } from '@/constants/graphSettings';
import { getPublishedContents, papersUrl } from '@/services/backend/papers';

const useViewPaperVersion = ({ paperId }: { paperId: string }) => {
    const { data, isLoading, error } = useSWR(paperId ? [paperId, papersUrl, 'getPublishedContents'] : null, ([params]) =>
        getPublishedContents(params),
    );

    const contributions = uniqBy(
        data?.statements
            ?.filter((statement) => statement.subject.classes.includes(CLASSES.CONTRIBUTION))
            .map((statement) => ({
                ...statement.subject,
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
