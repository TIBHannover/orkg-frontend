import { useEffect, useState } from 'react';
import { createResourceStatement, deleteStatementById } from 'services/backend/statements';
import { updateResource, createResource, getResource } from 'services/backend/resources';
import { useSelector, useDispatch } from 'react-redux';
import { updateContributionLabel } from 'slices/statementBrowserSlice';
import { toast } from 'react-toastify';
import Confirm from 'components/Confirmation/Confirmation';
import { PREDICATES, CLASSES } from 'constants/graphSettings';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes.js';
import { getSimilarContribution } from 'services/similarity/index';
import { useNavigate } from 'react-router-dom';
import {
    selectContribution,
    setPaperContributions,
    setIsAddingContribution,
    setIsDeletingContribution,
    setIsSavingContribution,
} from 'slices/viewPaperSlice';

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
    const navigate = useNavigate();

    useEffect(() => {
        if (contributions?.length && (selectedContribution !== contributionId || !contributionId)) {
            try {
                // apply selected contribution
                if (contributionId && !contributions.some(el => el.id === contributionId)) {
                    throw new Error('Contribution not found');
                }
                const selected = contributionId && contributions.some(el => el.id === contributionId) ? contributionId : contributions[0].id;
                setSelectedContribution(selected);
            } catch (error) {
                console.log(error);
                setLoadingContributionFailed(true);
            }
        }
    }, [contributionId, contributions, selectedContribution]);

    useEffect(() => {
        const handleSelectContribution = cId => {
            setIsSimilarContributionsLoading(true);
            setIsLoading(true);
            // get the contribution label
            const contributionResource = contributions.find(c => c.id === selectedContribution);
            if (contributionResource) {
                setLoadingContributionFailed(false);
                dispatch(
                    selectContribution({
                        contributionId: cId,
                        contributionLabel: contributionResource.label,
                    }),
                );
            } else {
                setLoadingContributionFailed(true);
            }
            getSimilarContribution(selectedContribution)
                .then(sContributions => {
                    const sContributionsData = sContributions.map(paper =>
                        // Fetch the data of each paper
                        getResource(paper.paperId).then(paperResource => {
                            paper.title = paperResource.label;
                            return paper;
                        }),
                    );
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

    const handleChangeContributionLabel = (cId, label) => {
        // find the index of contribution
        const objIndex = contributions.findIndex(obj => obj.id === cId);
        if (contributions[objIndex].label !== label) {
            // set the label of the contribution
            const updatedObj = { ...contributions[objIndex], label };
            // update the contributions array
            const newContributions = [...contributions.slice(0, objIndex), updatedObj, ...contributions.slice(objIndex + 1)];
            dispatch(setIsSavingContribution({ id: cId, status: true }));
            updateResource(cId, label)
                .then(() => {
                    dispatch(setPaperContributions(newContributions));
                    dispatch(updateContributionLabel({ id: cId, label }));
                    dispatch(setIsSavingContribution({ id: cId, status: false }));
                    toast.success('Contribution name updated successfully');
                })
                .catch(() => {
                    dispatch(setIsSavingContribution({ id: cId, status: false }));
                    toast.error('Something went wrong while updating contribution label.');
                });
        }
    };

    const handleCreateContribution = () => {
        dispatch(setIsAddingContribution(true));
        createResource(`Contribution ${contributions.length + 1}`, [CLASSES.CONTRIBUTION])
            .then(newContribution => createResourceStatement(paperId, PREDICATES.HAS_CONTRIBUTION, newContribution.id))
            .then(statement => {
                dispatch(setPaperContributions([...contributions, { ...statement.object, statementId: statement.id }]));
                dispatch(setIsAddingContribution(false));
                navigate(
                    reverse(ROUTES.VIEW_PAPER_CONTRIBUTION, {
                        resourceId: paperId,
                        contributionId: statement.object.id,
                    }),
                );
                toast.success('Contribution created successfully');
            })
            .catch(() => {
                dispatch(setIsAddingContribution(false));
                toast.error('Something went wrong while creating a new contribution.');
            });
    };

    const toggleDeleteContribution = async contributionId => {
        const result = await Confirm({
            title: 'Are you sure?',
            message: 'Are you sure you want to delete this contribution?',
        });

        if (result) {
            const objIndex = contributions.findIndex(obj => obj.id === contributionId);
            const { statementId } = contributions[objIndex];
            const newContributions = contributions.filter(contribution => contribution.id !== contributionId);
            dispatch(setIsDeletingContribution({ id: contributionId, status: true }));
            deleteStatementById(statementId)
                .then(() => {
                    navigate(
                        reverse(ROUTES.VIEW_PAPER_CONTRIBUTION, {
                            resourceId: paperId,
                            contributionId: newContributions[0].id,
                        }),
                    );
                    dispatch(setIsDeletingContribution({ id: contributionId, status: false }));
                    dispatch(setPaperContributions(newContributions));
                    setContributions(newContributions);
                    toast.success('Contribution deleted successfully');
                })
                .catch(() => {
                    dispatch(setIsDeletingContribution({ id: contributionId, status: false }));
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
        navigate,
    };
};

export default useContributions;
