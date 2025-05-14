import { reverse } from 'named-urls';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import Confirm from '@/components/Confirmation/Confirmation';
import { CLASSES, PREDICATES } from '@/constants/graphSettings';
import { EXTRACTION_METHODS } from '@/constants/misc';
import ROUTES from '@/constants/routes';
import { createResource, updateResource } from '@/services/backend/resources';
import { createResourceStatement, deleteStatementById, getStatement } from '@/services/backend/statements';
import {
    setContributionExtractionMethod,
    setIsAddingContribution,
    setIsDeletingContribution,
    setIsSavingContribution,
    setPaperContributions,
} from '@/slices/viewPaperSlice';

const useContributions = ({ paperId }) => {
    const contributions = useSelector((state) => state.viewPaper.contributions);
    const paperTitle = useSelector((state) => state.viewPaper.paper.title);
    const dispatch = useDispatch();

    const [, setContributions] = useState([]);
    const router = useRouter();

    const handleChangeContributionLabel = (cId, label) => {
        // find the index of contribution
        const objIndex = contributions.findIndex((obj) => obj.id === cId);
        if (contributions[objIndex].label !== label) {
            // set the label of the contribution
            const updatedObj = { ...contributions[objIndex], label };
            // update the contributions array
            const newContributions = [...contributions.slice(0, objIndex), updatedObj, ...contributions.slice(objIndex + 1)];
            dispatch(setIsSavingContribution({ id: cId, status: true }));
            updateResource(cId, { label })
                .then(() => {
                    dispatch(setPaperContributions(newContributions));
                    dispatch(setIsSavingContribution({ id: cId, status: false }));
                    toast.success('Contribution name updated successfully');
                })
                .catch(() => {
                    dispatch(setIsSavingContribution({ id: cId, status: false }));
                    toast.error('Something went wrong while updating contribution label.');
                });
        }
    };

    const handleAutomaticContributionVerification = (cId) => {
        dispatch(setContributionExtractionMethod({ id: cId, extractionMethod: EXTRACTION_METHODS.MANUAL }));
        dispatch(setIsSavingContribution({ id: cId, status: true }));
        updateResource(cId, { extraction_method: EXTRACTION_METHODS.MANUAL })
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
        createResource({ label: `Contribution ${contributions.length + 1}`, classes: [CLASSES.CONTRIBUTION] })
            .then((newContributionId) => createResourceStatement(paperId, PREDICATES.HAS_CONTRIBUTION, newContributionId))
            .then(async (statementId) => {
                const statement = await getStatement(statementId);
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

    const toggleDeleteContribution = async (contributionId) => {
        const result = await Confirm({
            title: 'Are you sure?',
            message: 'Are you sure you want to delete this contribution?',
        });

        if (result) {
            const objIndex = contributions.findIndex((obj) => obj.id === contributionId);
            const { statementId } = contributions[objIndex];
            const newContributions = contributions.filter((contribution) => contribution.id !== contributionId);
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
