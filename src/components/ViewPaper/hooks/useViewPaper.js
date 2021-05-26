import { useEffect, useState, useCallback } from 'react';
import { getStatementsBySubject, createResourceStatement, deleteStatementById } from 'services/backend/statements';
import { getContributorInformationById } from 'services/backend/contributors';
import { getIsVerified } from 'services/backend/papers';
import { getObservatoryAndOrganizationInformation } from 'services/backend/observatories';
import { getResource, updateResource, createResource, getContributorsByResourceId } from 'services/backend/resources';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { resetStatementBrowser, updateContributionLabel } from 'actions/statementBrowser';
import { loadPaper, setPaperAuthors } from 'actions/viewPaper';
import { toast } from 'react-toastify';
import Confirm from 'reactstrap-confirm';
import { getPaperData_ViewPaper } from 'utils';
import { PREDICATES, CLASSES, MISC } from 'constants/graphSettings';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes.js';

const useViewPaper = ({ paperId, contributionId }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingFailed, setIsLoadingFailed] = useState(false);
    const [isLoadingContributionFailed, setLoadingContributionFailed] = useState(false);
    const [contributions, setContributions] = useState([]);
    const [selectedContribution, setSelectedContribution] = useState('');
    const [showGraphModal, setShowGraphModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [observatoryInfo, setObservatoryInfo] = useState({});
    const [contributors, setContributors] = useState([]);
    const [showHeaderBar, setShowHeaderBar] = useState(false);
    const dispatch = useDispatch();
    const history = useHistory();

    const loadAuthorsORCID = useCallback(
        paperAuthors => {
            let authors = [];
            if (paperAuthors.length > 0) {
                authors = paperAuthors
                    .filter(author => author.classes && author.classes.includes(CLASSES.AUTHOR))
                    .map(author => {
                        return getStatementsBySubject({ id: author.id }).then(authorStatements => {
                            return authorStatements.find(statement => statement.predicate.id === PREDICATES.HAS_ORCID);
                        });
                    });
            }
            return Promise.all(authors).then(authorsORCID => {
                const authorsArray = [];
                for (const author of paperAuthors) {
                    const orcid = authorsORCID.find(a => a.subject.id === author.id);
                    if (orcid) {
                        author.orcid = orcid.object.label;
                        authorsArray.push(author);
                    } else {
                        author.orcid = '';
                        authorsArray.push(author);
                    }
                }
                dispatch(
                    setPaperAuthors({
                        authors: authorsArray
                    })
                );
            });
        },
        [dispatch]
    );

    const loadPaperData = useCallback(() => {
        setIsLoading(true);
        dispatch(resetStatementBrowser());
        getResource(paperId)
            .then(paperResource => {
                if (!paperResource.classes.includes(CLASSES.PAPER)) {
                    setIsLoading(false);
                    setIsLoadingFailed(true);
                    return;
                }

                processProvenanceInformation(paperResource, paperId);

                Promise.all([getStatementsBySubject({ id: paperId }), getIsVerified(paperId).catch(() => false)]).then(
                    ([paperStatements, verified]) => {
                        const paperData = getPaperData_ViewPaper(paperResource, paperStatements);
                        // Set document title
                        document.title = `${paperResource.label} - ORKG`;
                        dispatch(loadPaper({ ...paperData, verified: verified }));
                        setIsLoading(false);
                        setContributions(paperData.contributions);
                        loadAuthorsORCID(paperData.authors);
                        return paperData.contributions;
                    }
                );
            })
            .catch(error => {
                setIsLoading(false);
                setIsLoadingFailed(true);
            });
    }, [dispatch, loadAuthorsORCID, paperId]);

    useEffect(() => {
        loadPaperData();
    }, [loadPaperData, paperId]);

    useEffect(() => {
        if (contributions?.length && selectedContribution !== contributionId) {
            try {
                // apply selected contribution
                if (
                    contributionId &&
                    !contributions.some(el => {
                        return el.id === contributionId;
                    })
                ) {
                    throw new Error('Contribution not found');
                }
                const selected =
                    contributionId &&
                    contributions.some(el => {
                        return el.id === contributionId;
                    })
                        ? contributionId
                        : contributions[0].id;
                setSelectedContribution(selected);
            } catch (error) {
                console.log(error);
                if (error.message === 'Contribution not found') {
                    setLoadingContributionFailed(true);
                } else {
                    setIsLoading(false);
                    setIsLoadingFailed(true);
                }
            }
        }
    }, [contributionId, contributions, selectedContribution]);

    const handleShowHeaderBar = isVisible => {
        setShowHeaderBar(!isVisible);
    };

    const processProvenanceInformation = (paperResource, resourceId) => {
        const observatory = getObservatoryAndOrganizationInformation(paperResource.observatory_id, paperResource.organization_id).catch(e => {});
        const creator =
            paperResource.created_by && paperResource.created_by !== MISC.UNKNOWN_ID
                ? getContributorInformationById(paperResource.created_by).catch(e => {})
                : undefined;
        Promise.all([observatory, creator]).then(data => {
            setObservatoryInfo({
                ...(data[0] ? data[0] : {}),
                created_at: paperResource.created_at,
                created_by: data[1] !== undefined ? data[1] : null,
                extraction_method: paperResource.extraction_method
            });
        });

        getContributorsByResourceId(resourceId).then(contributors =>
            Promise.all(contributors).then(data => {
                setContributors(data);
            })
        );
    };

    // @param sync : to update the contribution label on the backend.
    const handleChangeContributionLabel = async (contributionId, label) => {
        //find the index of contribution
        const objIndex = contributions.findIndex(obj => obj.id === contributionId);
        if (contributions[objIndex].label !== label) {
            // set the label of the contribution
            const updatedObj = { ...contributions[objIndex], label: label };
            // update the contributions array
            const newContributions = [...contributions.slice(0, objIndex), updatedObj, ...contributions.slice(objIndex + 1)];
            setContributions(newContributions);
            dispatch(updateContributionLabel({ id: contributionId, label: label }));
            await updateResource(contributionId, label);
            toast.success('Contribution name updated successfully');
        }
    };

    const handleCreateContribution = async () => {
        const newContribution = await createResource(`Contribution ${contributions.length + 1}`, [CLASSES.CONTRIBUTION]);
        const statement = await createResourceStatement(paperId, PREDICATES.HAS_CONTRIBUTION, newContribution.id);
        setContributions([...contributions, { ...statement.object, statementId: statement.id }]);
        toast.success('Contribution created successfully');
    };

    const toggleDeleteContribution = async contributionId => {
        const result = await Confirm({
            title: 'Are you sure?',
            message: 'Are you sure you want to delete this contribution?',
            cancelColor: 'light'
        });

        if (result) {
            const objIndex = contributions.findIndex(obj => obj.id === contributionId);
            const statementId = contributions[objIndex].statementId;
            const newContributions = contributions.filter(function(contribution) {
                return contribution.id !== contributionId;
            });
            //setSelectedContribution(newContributions[0].id);
            history.push(
                reverse(ROUTES.VIEW_PAPER, {
                    resourceId: paperId,
                    contributionId: newContributions[0].id
                })
            );
            setContributions(newContributions);
            await deleteStatementById(statementId);
            toast.success('Contribution deleted successfully');
        }
    };

    const getObservatoryInfo = () => {
        getResource(paperId)
            .then(paperResource => {
                processProvenanceInformation(paperResource, paperId);
            })
            .catch(error => {
                setIsLoading(false);
            });
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
        toggle,
        handleShowHeaderBar,
        isLoadingContributionFailed,
        selectedContribution,
        contributions,
        handleChangeContributionLabel,
        setEditMode,
        handleCreateContribution,
        toggleDeleteContribution,
        observatoryInfo,
        contributors,
        getObservatoryInfo,
        setShowGraphModal,
        showGraphModal
    };
};

export default useViewPaper;
