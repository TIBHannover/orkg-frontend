import useIsEditMode from 'components/Utils/hooks/useIsEditMode';
import { CLASSES } from 'constants/graphSettings';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getIsVerified } from 'services/backend/papers';
import { getResource } from 'services/backend/resources';
import { getStatementsBundleBySubject } from 'services/backend/statements';
import { resetStatementBrowser } from 'slices/statementBrowserSlice';
import { loadPaper } from 'slices/viewPaperSlice';
import { getPaperDataViewPaper } from 'utils';

const useViewPaper = ({ paperId }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingFailed, setIsLoadingFailed] = useState(false);
    const [showGraphModal, setShowGraphModal] = useState(false);
    const [showHeaderBar, setShowHeaderBar] = useState(false);
    const dispatch = useDispatch();
    const { isEditMode, toggleIsEditMode } = useIsEditMode();

    const loadPaperData = useCallback(() => {
        setIsLoading(true);
        dispatch(resetStatementBrowser());
        getResource(paperId)
            .then(paperResource => {
                if (!paperResource.classes.includes(CLASSES.PAPER)) {
                    setIsLoadingFailed(true);
                    setIsLoading(false);
                    return;
                }
                // Load the paper metadata but skip the research field and contribution data
                // 3 levels so the author list (level 2) and nested ORCIDs (level 3) can be fetched
                Promise.all([
                    getStatementsBundleBySubject({ id: paperId, maxLevel: 3, blacklist: [CLASSES.RESEARCH_FIELD, CLASSES.CONTRIBUTION] }),
                    getIsVerified(paperId).catch(() => false),
                ]).then(([paperStatements, verified]) => {
                    const paperData = getPaperDataViewPaper(paperResource, paperStatements.statements);
                    dispatch(loadPaper({ ...paperData, verified }));
                    setIsLoading(false);
                });
            })
            .catch(error => {
                setIsLoadingFailed(true);
                setIsLoading(false);
            });
    }, [dispatch, paperId]);

    useEffect(() => {
        loadPaperData();
    }, [loadPaperData, paperId]);

    const handleShowHeaderBar = isVisible => {
        setShowHeaderBar(!isVisible);
    };

    const toggle = type => {
        switch (type) {
            case 'showGraphModal':
                setShowGraphModal(v => !v);
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
        toggleIsEditMode,
        setShowGraphModal,
    };
};

export default useViewPaper;
