import { reverse } from 'named-urls';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { mutate } from 'swr';

import Confirm from '@/components/Confirmation/Confirmation';
import useViewPaper from '@/components/ViewPaper/hooks/useViewPaper';
import { CLASSES, PREDICATES } from '@/constants/graphSettings';
import { EXTRACTION_METHODS } from '@/constants/misc';
import ROUTES from '@/constants/routes';
import { createResource, updateResource } from '@/services/backend/resources';
import { createResourceStatement, deleteStatementById } from '@/services/backend/statements';
import { thingsUrl } from '@/services/backend/things';

type UseContributionsProps = {
    paperId: string;
};

const useContributions = ({ paperId }: UseContributionsProps) => {
    const { contributions, mutateContributions, mutatePaper } = useViewPaper({ paperId });
    const [isAddingContribution, setIsAddingContribution] = useState(false);
    const router = useRouter();

    const handleChangeContributionLabel = async (cId: string, label: string) => {
        const objIndex = contributions?.findIndex((obj) => obj.id === cId);
        if (objIndex !== undefined && contributions?.[objIndex]?.label !== label) {
            try {
                await updateResource(cId, { label });
                mutateContributions();
                mutatePaper();
                // reload resource label because we are in paper view and the data browser is not updated
                mutate([cId, thingsUrl, 'getThing'], undefined, {
                    revalidate: true,
                });
                toast.success('Contribution name updated successfully');
            } catch {
                toast.error('Something went wrong while updating contribution label.');
            }
        }
    };

    const handleAutomaticContributionVerification = async (cId: string) => {
        try {
            await updateResource(cId, { extractionMethod: EXTRACTION_METHODS.MANUAL });
            mutateContributions();
            mutatePaper();
            toast.success('Contribution extraction method updated successfully.');
        } catch {
            toast.error('Something went wrong while verifying contribution.');
        }
    };

    const handleCreateContribution = async () => {
        setIsAddingContribution(true);
        try {
            const count = contributions?.length || 0;
            const newContributionId = await createResource({ label: `Contribution ${count + 1}`, classes: [CLASSES.CONTRIBUTION] });
            await createResourceStatement(paperId, PREDICATES.HAS_CONTRIBUTION, newContributionId);
            setIsAddingContribution(false);
            router.push(
                `${reverse(ROUTES.VIEW_PAPER_CONTRIBUTION, {
                    resourceId: paperId,
                    contributionId: newContributionId,
                })}?isEditMode=true`,
            );
            mutateContributions();
            mutatePaper();
            toast.success('Contribution created successfully');
        } catch {
            setIsAddingContribution(false);
            toast.error('Something went wrong while creating a new contribution.');
        }
    };

    const toggleDeleteContribution = async (contributionId: string) => {
        const result = await Confirm({
            title: 'Are you sure?',
            message: 'Are you sure you want to delete this contribution?',
        });

        if (result) {
            const objIndex = contributions?.findIndex((obj) => obj.id === contributionId);
            if (!objIndex) {
                return;
            }
            const c = contributions?.[objIndex];
            if (!c) {
                return;
            }
            const { statementId } = c;
            const newContributions = contributions?.filter((contribution) => contribution.id !== contributionId) ?? [];
            try {
                await deleteStatementById(statementId);
                router.push(
                    reverse(ROUTES.VIEW_PAPER_CONTRIBUTION, {
                        resourceId: paperId,
                        contributionId: newContributions[0].id,
                    }),
                );
                mutateContributions();
                mutatePaper();
                toast.success('Contribution deleted successfully');
            } catch {
                toast.error('Something went wrong while deleting the contribution.');
            }
        }
    };

    return {
        handleAutomaticContributionVerification,
        handleChangeContributionLabel,
        handleCreateContribution,
        toggleDeleteContribution,
        isAddingContribution,
        router,
    };
};

export default useContributions;
