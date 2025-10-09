import { sortBy } from 'lodash';
import { env } from 'next-runtime-env';
import { useState } from 'react';
import useSWR from 'swr';

import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import { getPaperContentType } from '@/components/ViewPaper/hooks/helpers';
import { CLASSES, PREDICATES } from '@/constants/graphSettings';
import { getOriginalPaperId, getPaper, papersUrl } from '@/services/backend/papers';
import { getResource } from '@/services/backend/resources';
import { getStatements, getStatementsBundleBySubject, statementsUrl } from '@/services/backend/statements';
import { Resource } from '@/services/backend/types';

const useViewPaper = ({ paperId }: { paperId: string }) => {
    const [showGraphModal, setShowGraphModal] = useState(false);
    const [showHeaderBar, setShowHeaderBar] = useState(false);
    const { isEditMode, toggleIsEditMode } = useIsEditMode();

    const { data: resource } = useSWR(paperId ? [paperId, papersUrl, 'getResource'] : null, ([params]) => getResource(params));

    const {
        data: _paper,
        isLoading: isPaperLoading,
        error: errorPaper,
        mutate: mutatePaper,
    } = useSWR(resource && paperId && !resource?.classes.includes(CLASSES.PAPER_VERSION) ? [paperId, papersUrl, 'getPaper'] : null, ([params]) =>
        getPaper(params),
    );

    const { data: _paperVersion, isLoading: isPaperVersionLoading } = useSWR(
        resource && paperId && resource?.classes.includes(CLASSES.PAPER_VERSION)
            ? [{ id: paperId, maxLevel: 3, blacklist: [CLASSES.RESEARCH_FIELD] }, statementsUrl, 'getStatementsBundleBySubject']
            : null,
        async ([params]) => {
            const pStatements = await getStatementsBundleBySubject(params);
            const data = getPaperContentType(resource!, pStatements.statements);
            return data;
        },
    );

    const { data: originalPaperId } = useSWR(
        resource && paperId && resource?.classes.includes(CLASSES.PAPER_VERSION) ? [paperId, papersUrl, 'getOriginalPaperId'] : null,
        async ([params]) => getOriginalPaperId(params),
    );

    const paper = _paper || _paperVersion;

    const {
        data: contributions,
        isLoading: isContributionsLoading,
        mutate: mutateContributions,
    } = useSWR(paperId ? [{ subjectId: paperId, predicateId: PREDICATES.HAS_CONTRIBUTION }, statementsUrl, 'getStatements'] : null, ([params]) =>
        getStatements(params).then((s) => {
            return sortBy(
                s.map((statement) => ({ ...statement.object, statementId: statement.id } as Resource & { statementId: string })),
                'label',
            );
        }),
    );

    const {
        data: version,
        isLoading: isVersionStatementLoading,
        mutate: mutateVersionStatement,
    } = useSWR(paperId ? [{ subjectId: paperId, predicateId: PREDICATES.HAS_PREVIOUS_VERSION }, statementsUrl, 'getStatements'] : null, ([params]) =>
        getStatements(params).then((s) => {
            return s?.[0]?.object || null;
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
        isLoadingPaperVersion: isPaperVersionLoading,
        isLoadingContributions: isContributionsLoading,
        isLoadingVersionStatement: isVersionStatementLoading,
        paper,
        contributions,
        version,
        showHeaderBar,
        isEditMode,
        showGraphModal,
        toggle,
        handleShowHeaderBar,
        setShowGraphModal,
        mutatePaper,
        mutateContributions,
        mutateVersionStatement,
    };
};

export default useViewPaper;
