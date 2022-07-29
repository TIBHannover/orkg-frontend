import { useEffect, useState, useCallback } from 'react';
import { getStatementsBundleBySubject } from 'services/backend/statements';
import { getIsVerified } from 'services/backend/papers';
import { getResource } from 'services/backend/resources';
import { useDispatch } from 'react-redux';
import { resetStatementBrowser } from 'slices/statementBrowserSlice';
import { loadPaper, setPaperAuthors } from 'slices/viewPaperSlice';
import { getPaperDataViewPaper, filterObjectOfStatementsByPredicateAndClass } from 'utils';
import { PREDICATES, CLASSES } from 'constants/graphSettings';

const useViewPaper = ({ paperId }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingFailed, setIsLoadingFailed] = useState(false);
    const [showGraphModal, setShowGraphModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [showHeaderBar, setShowHeaderBar] = useState(false);
    const dispatch = useDispatch();

    const setAuthorsORCID = useCallback(
        (paperStatements, pId) => {
            let authorsArray = [];
            const paperAuthors = filterObjectOfStatementsByPredicateAndClass(paperStatements, PREDICATES.HAS_AUTHOR, false, null, pId);
            for (const author of paperAuthors) {
                const orcid = paperStatements.find(s => s.subject.id === author.id && s.predicate.id === PREDICATES.HAS_ORCID);
                if (orcid) {
                    authorsArray.push({ ...author, orcid: orcid.object.label });
                } else {
                    authorsArray.push({ ...author, orcid: '' });
                }
            }
            authorsArray = authorsArray.length ? authorsArray.sort((a, b) => a.s_created_at.localeCompare(b.s_created_at)) : [];
            dispatch(setPaperAuthors(authorsArray));
        },
        [dispatch],
    );

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
                Promise.all([
                    getStatementsBundleBySubject({ id: paperId, maxLevel: 2, blacklist: [CLASSES.RESEARCH_FIELD, CLASSES.CONTRIBUTION] }),
                    getIsVerified(paperId).catch(() => false),
                ]).then(([paperStatements, verified]) => {
                    const paperData = getPaperDataViewPaper(paperResource, paperStatements.statements?.filter(s => s.subject.id === paperId));
                    dispatch(loadPaper({ ...paperData, verified }));
                    setIsLoading(false);
                    setAuthorsORCID(paperStatements.statements, paperId);
                });
            })
            .catch(error => {
                setIsLoadingFailed(true);
                setIsLoading(false);
            });
    }, [dispatch, paperId, setAuthorsORCID]);

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
                setEditMode(v => !v);
                break;
            default:
                break;
        }
    };

    return {
        isLoading,
        isLoadingFailed,
        showHeaderBar,
        editMode,
        showGraphModal,
        toggle,
        handleShowHeaderBar,
        setEditMode,
        setShowGraphModal,
    };
};

export default useViewPaper;
