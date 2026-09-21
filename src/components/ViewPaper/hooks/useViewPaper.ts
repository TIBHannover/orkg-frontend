import { sortBy } from 'lodash';
import { env } from 'next-runtime-env';
import { useState } from 'react';
import useSWR from 'swr';

import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import { PREDICATES } from '@/constants/graphSettings';
import { getPaper, papersUrl } from '@/services/backend/papers';
import { getStatements, statementsUrl } from '@/services/backend/statements';
import { Resource } from '@/services/backend/types';

const useViewPaper = ({ paperId }: { paperId: string }) => {
    const [showGraphModal, setShowGraphModal] = useState(false);
    const [showHeaderBar, setShowHeaderBar] = useState(false);
    const { isEditMode, toggleIsEditMode } = useIsEditMode();

    // the papers endpoint serves head papers and published snapshots alike
    const {
        data: paper,
        isLoading: isPaperLoading,
        error: errorPaper,
        mutate: mutatePaper,
    } = useSWR(paperId ? [paperId, papersUrl, 'getPaper'] : null, ([params]) => getPaper(params));

    // a snapshot carries the same history as its head, with versions.head pointing at the editable paper
    const originalPaperId = paper?.published ? paper.versions?.head?.id : undefined;

    const publishedVersions = paper?.versions?.published ?? [];
    const [version] = publishedVersions;

    const {
        data: contributions,
        isLoading: isContributionsLoading,
        mutate: mutateContributions,
    } = useSWR(paperId ? [{ subjectId: paperId, predicateId: PREDICATES.HAS_CONTRIBUTION }, statementsUrl, 'getStatements'] : null, ([params]) =>
        getStatements(params).then((s) => {
            return sortBy(
                s.map((statement) => ({ ...statement.object, statementId: statement.id }) as Resource & { statementId: string }),
                'label',
            );
        }),
    );

    const dataCiteDoi = paper?.identifiers?.doi?.find((doi) => doi.startsWith(env('NEXT_PUBLIC_DATACITE_DOI_PREFIX') ?? ''));

    const handleShowHeaderBar = (isVisible: boolean) => {
        setShowHeaderBar(!isVisible);
    };

    const toggle = (type: string) => {
        switch (type) {
            case 'showGraphModal':
                setShowGraphModal((v) => !v);
                break;
            case 'editMode':
                toggleIsEditMode();
                break;
            default:
                break;
        }
    };

    return {
        dataCiteDoi,
        originalPaperId,
        isLoading: isPaperLoading,
        isLoadingFailed: !!errorPaper,
        isLoadingContributions: isContributionsLoading,
        paper,
        contributions,
        version,
        publishedVersions,
        showHeaderBar,
        isEditMode,
        showGraphModal,
        toggle,
        handleShowHeaderBar,
        setShowGraphModal,
        mutatePaper,
        mutateContributions,
    };
};

export default useViewPaper;
