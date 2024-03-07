import { useEffect, useState } from 'react';
import { createResourceStatement, deleteStatementById } from 'services/backend/statements';
import { updateResource, createResource } from 'services/backend/resources';
import { useSelector, useDispatch } from 'react-redux';
import { updateContributionLabel } from 'slices/statementBrowserSlice';
import { toast } from 'react-toastify';
import Confirm from 'components/Confirmation/Confirmation';
import { PREDICATES, CLASSES } from 'constants/graphSettings';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes.js';
import useRouter from 'components/NextJsMigration/useRouter';
import { EXTRACTION_METHODS } from 'constants/misc';
import {
    selectContribution,
    setPaperContributions,
    setIsAddingContribution,
    setIsDeletingContribution,
    setIsSavingContribution,
    setSelectedContributionId,
    setContributionExtractionMethod,
} from 'slices/viewPaperSlice';

const useContributions = ({ paperId, contributionId }) => {
    const contributions = useSelector(state => state.viewPaper.contributions);
    const paperTitle = useSelector(state => state.viewPaper.paper.title);
    const selectedContributionId = useSelector(state => state.viewPaper.selectedContributionId);
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingContributionFailed, setLoadingContributionFailed] = useState(false);

    const [, setContributions] = useState([]);
    const router = useRouter();

    useEffect(() => {
        if (contributions?.length && (selectedContributionId !== contributionId || !contributionId)) {
            try {
                // apply selected contribution
                if (contributionId && !contributions.some(el => el.id === contributionId)) {
                    throw new Error('Contribution not found');
                }
                const selected = contributionId && contributions.some(el => el.id === contributionId) ? contributionId : contributions[0].id;
                dispatch(setSelectedContributionId(selected));
            } catch {
                setLoadingContributionFailed(true);
            }
        }
    }, [contributionId, contributions, dispatch, selectedContributionId]);

    useEffect(() => {
        const handleSelectContribution = cId => {
            setIsLoading(true);
            // get the contribution label
            const contributionResource = contributions?.find(c => c.id === selectedContributionId);
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
            setIsLoading(false);
        };
        handleSelectContribution(selectedContributionId);
    }, [contributions, dispatch, selectedContributionId]);

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

    const handleAutomaticContributionVerification = cId => {
        dispatch(setContributionExtractionMethod({ id: cId, extractionMethod: EXTRACTION_METHODS.MANUAL }));
        dispatch(setIsSavingContribution({ id: cId, status: true }));
        updateResource(cId, undefined, null, EXTRACTION_METHODS.MANUAL)
            .then(() => {
                dispatch(setIsSavingContribution({ id: cId, status: false }));
                toast.success('Contribution extraction method updated successfully.');
            })
            .catch(() => {
                dispatch(setIsSavingContribution({ id: cId, status: false }));
                toast.error('Something went wrong while verifying contribution.');
            });
    };

    const handleCreateContribution = () => {
        dispatch(setIsAddingContribution(true));
        createResource(`Contribution ${contributions.length + 1}`, [CLASSES.CONTRIBUTION])
            .then(newContribution => createResourceStatement(paperId, PREDICATES.HAS_CONTRIBUTION, newContribution.id))
            .then(statement => {
                dispatch(setPaperContributions([...contributions, { ...statement.object, statementId: statement.id }]));
                dispatch(setIsAddingContribution(false));
                router.push(
                    `${reverse(ROUTES.VIEW_PAPER_CONTRIBUTION, {
                        resourceId: paperId,
                        contributionId: statement.object.id,
                    })}?isEditMode=true`,
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
                    router.push(
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
        selectedContributionId,
        contributions,
        paperTitle,
        handleAutomaticContributionVerification,
        handleChangeContributionLabel,
        handleCreateContribution,
        toggleDeleteContribution,
        router,
    };
};

export default useContributions;
