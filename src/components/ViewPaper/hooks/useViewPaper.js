import useIsEditMode from 'components/Utils/hooks/useIsEditMode';
import { PREDICATES } from 'constants/graphSettings';
import { sortBy } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getPaper } from 'services/backend/papers';
import { getStatementsBySubjectAndPredicate } from 'services/backend/statements';
import { resetStatementBrowser } from 'slices/statementBrowserSlice';
import { loadPaper, setPaperContributions, setVersion } from 'slices/viewPaperSlice';

const useViewPaper = ({ paperId }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingFailed, setIsLoadingFailed] = useState(false);
    const [showGraphModal, setShowGraphModal] = useState(false);
    const [showHeaderBar, setShowHeaderBar] = useState(false);
    const dispatch = useDispatch();
    const { isEditMode, toggleIsEditMode } = useIsEditMode();

    const loadPaperData = useCallback(async () => {
        setIsLoading(true);
        dispatch(resetStatementBrowser());
        try {
            const paper = await getPaper(paperId);
            dispatch(loadPaper(paper));
            const contributions = await getStatementsBySubjectAndPredicate({ subjectId: paperId, predicateId: PREDICATES.HAS_CONTRIBUTION });
            dispatch(
                setPaperContributions(
                    sortBy(
                        contributions.map((statement) => ({ ...statement.object, statementId: statement.id })),
                        'label',
                    ),
                ),
            );
            const versionStatement =
                (await getStatementsBySubjectAndPredicate({ subjectId: paperId, predicateId: PREDICATES.HAS_PREVIOUS_VERSION }))?.[0] ?? null;
            if (versionStatement) {
                dispatch(setVersion({ ...versionStatement?.object, statementId: versionStatement.id }));
            }
        } catch (error) {
            console.error(error);
            setIsLoadingFailed(true);
        } finally {
            setIsLoading(false);
        }
    }, [dispatch, paperId]);

    useEffect(() => {
        loadPaperData();
    }, [loadPaperData, paperId]);

    const handleShowHeaderBar = (isVisible) => {
        setShowHeaderBar(!isVisible);
    };

    const toggle = (type) => {
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
        isLoading,
        isLoadingFailed,
        showHeaderBar,
        isEditMode,
        showGraphModal,
        toggle,
        handleShowHeaderBar,
        setShowGraphModal,
    };
};

export default useViewPaper;
