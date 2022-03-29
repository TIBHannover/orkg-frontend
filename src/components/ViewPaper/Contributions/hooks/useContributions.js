import { useEffect, useState } from 'react';
import { createResourceStatement, deleteStatementById } from 'services/backend/statements';
import { updateResource, createResource } from 'services/backend/resources';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { updateContributionLabel } from 'actions/statementBrowser';
import { toast } from 'react-toastify';
import Confirm from 'components/Confirmation/Confirmation';
import { PREDICATES, CLASSES } from 'constants/graphSettings';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes.js';
import { getResource } from 'services/backend/resources';
import { getSimilarContribution } from 'services/similarity/index';
import {
    selectContribution,
    setPaperContributions,
    isAddingContribution,
    doneAddingContribution,
    isDeletingContribution,
    doneDeletingContribution,
    isSavingContribution,
    doneSavingContribution
} from 'actions/viewPaper';

const useContributions = ({ paperId, contributionId }) => {
    const [similarContributions, setSimilarContributions] = useState([]);
    const [isSimilarContributionsLoading, setIsSimilarContributionsLoading] = useState(true);
    const [isSimilarContributionsFailedLoading, setIsSimilarContributionsFailedLoading] = useState(false);
    const contributions = useSelector(state => state.viewPaper.contributions);
    const [selectedContribution, setSelectedContribution] = useState(contributionId);
    const paperResource = useSelector(state => state.viewPaper.paperResource);
    const dispatch = useDispatch();

    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingContributionFailed, setLoadingContributionFailed] = useState(false);

    const [, setContributions] = useState([]);
    const history = useHistory();

    useEffect(() => {
        if (contributions?.length && (selectedContribution !== contributionId || !contributionId)) {
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
                setLoadingContributionFailed(true);
            }
        }
    }, [contributionId, contributions, selectedContribution]);

    useEffect(() => {
        const handleSelectContribution = contributionId => {
            setIsSimilarContributionsLoading(true);
            setIsLoading(true);
            // get the contribution label
            const contributionResource = contributions.find(c => c.id === selectedContribution);
            if (contributionResource) {
                setLoadingContributionFailed(false);
                dispatch(
                    selectContribution({
                        contributionId,
                        contributionLabel: contributionResource.label
                    })
                );
            } else {
                setLoadingContributionFailed(true);
            }
            getSimilarContribution(selectedContribution)
                .then(sContributions => {
                    const sContributionsData = sContributions.map(paper => {
                        // Fetch the data of each paper
                        return getResource(paper.paperId).then(paperResource => {
                            paper.title = paperResource.label;
                            return paper;
                        });
                    });
                    Promise.all(sContributionsData).then(results => {
                        setSimilarContributions(results);
                        setIsSimilarContributionsLoading(false);
                        setIsSimilarContributionsFailedLoading(false);
                    });
                })
                .catch(error => {
                    setSimilarContributions([]);
                    setIsSimilarContributionsLoading(false);
                    setIsSimilarContributionsFailedLoading(true);
                });
            setIsLoading(false);
        };
        handleSelectContribution(selectedContribution);
    }, [contributions, dispatch, selectedContribution]);

    const handleChangeContributionLabel = (contributionId, label) => {
        //find the index of contribution
        const objIndex = contributions.findIndex(obj => obj.id === contributionId);
        if (contributions[objIndex].label !== label) {
            // set the label of the contribution
            const updatedObj = { ...contributions[objIndex], label: label };
            // update the contributions array
            const newContributions = [...contributions.slice(0, objIndex), updatedObj, ...contributions.slice(objIndex + 1)];
            dispatch(isSavingContribution({ id: contributionId }));
            updateResource(contributionId, label)
                .then(() => {
                    dispatch(setPaperContributions(newContributions));
                    dispatch(updateContributionLabel({ id: contributionId, label: label }));
                    dispatch(doneSavingContribution({ id: contributionId }));
                    toast.success('Contribution name updated successfully');
                })
                .catch(() => {
                    dispatch(doneSavingContribution({ id: contributionId }));
                    toast.error('Something went wrong while updating contribution label.');
                });
        }
    };

    const handleCreateContribution = () => {
        dispatch(isAddingContribution());
        createResource(`Contribution ${contributions.length + 1}`, [CLASSES.CONTRIBUTION])
            .then(newContribution => createResourceStatement(paperId, PREDICATES.HAS_CONTRIBUTION, newContribution.id))
            .then(statement => {
                dispatch(setPaperContributions([...contributions, { ...statement.object, statementId: statement.id }]));
                dispatch(doneAddingContribution());
                toast.success('Contribution created successfully');
            })
            .catch(() => {
                dispatch(doneAddingContribution());
                toast.error('Something went wrong while creating a new contribution.');
            });
    };

    const toggleDeleteContribution = async contributionId => {
        const result = await Confirm({
            title: 'Are you sure?',
            message: 'Are you sure you want to delete this contribution?'
        });

        if (result) {
            const objIndex = contributions.findIndex(obj => obj.id === contributionId);
            const statementId = contributions[objIndex].statementId;
            const newContributions = contributions.filter(function(contribution) {
                return contribution.id !== contributionId;
            });
            dispatch(isDeletingContribution({ id: contributionId }));
            deleteStatementById(statementId)
                .then(() => {
                    history.push(
                        reverse(ROUTES.VIEW_PAPER, {
                            resourceId: paperId,
                            contributionId: newContributions[0].id
                        })
                    );
                    dispatch(doneDeletingContribution({ id: contributionId }));
                    dispatch(setPaperContributions(newContributions));
                    setContributions(newContributions);
                    toast.success('Contribution deleted successfully');
                })
                .catch(() => {
                    dispatch(doneDeletingContribution({ id: contributionId }));
                    toast.error('Something went wrong while deleting the contribution.');
                });
        }
    };

    return {
        isLoading,
        isLoadingContributionFailed,
        isSimilarContributionsLoading,
        isSimilarContributionsFailedLoading,
        similarContributions,
        selectedContribution,
        contributions,
        paperTitle: paperResource.label,
        handleChangeContributionLabel,
        handleCreateContribution,
        toggleDeleteContribution,
        history
    };
};

export default useContributions;
