import { useRouter } from 'next/navigation';
import pluralize from 'pluralize';
import { useState } from 'react';
import { toast } from 'react-toastify';

import Confirm from '@/components/Confirmation/Confirmation';
import { CLASSES, PREDICATES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { updateResource } from '@/services/backend/resources';
import { getStatements } from '@/services/backend/statements';

function useDeletePapers({ paperIds, redirect = false, finishLoadingCallback = () => {} }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const deletePapers = async () => {
        const confirm = await Confirm({
            title: 'Are you sure?',
            message: `Are you sure you want to remove ${pluralize(
                'paper',
                paperIds.length,
                true,
            )} from the ORKG? Deleting papers is bad practice so we encourage you to use this operation with caution!`,
        });

        if (confirm) {
            setIsLoading(true);

            const promises = paperIds.map((id) => {
                // set the class of paper to DeletedPapers
                const promisePaper = updateResource(id, { classes: [CLASSES.PAPER_DELETED] });
                // set the class of paper of contributions to DeletedContribution
                const promisesContributions = getStatements({
                    subjectId: id,
                    predicateId: PREDICATES.HAS_CONTRIBUTION,
                }).then((contributions) =>
                    Promise.all(
                        contributions.map((contribution) => updateResource(contribution.object.id, { classes: [CLASSES.CONTRIBUTION_DELETED] })),
                    ),
                );
                return Promise.all([promisePaper, promisesContributions]);
            });

            await Promise.all(promises);

            setIsLoading(false);
            finishLoadingCallback();

            toast.success(`Successfully deleted ${pluralize('paper', paperIds.length, true)}`);

            if (redirect) {
                router.push(ROUTES.HOME);
            }
        }
    };

    return { deletePapers, isLoading };
}
export default useDeletePapers;
