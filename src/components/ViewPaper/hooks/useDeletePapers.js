import { useState } from 'react';
import { CLASSES } from 'constants/graphSettings';
import Confirm from 'components/Confirmation/Confirmation';
import { getStatementsBySubjectAndPredicate } from 'services/backend/statements';
import { updateResourceClasses } from 'services/backend/resources';
import { toast } from 'react-toastify';
import { PREDICATES } from 'constants/graphSettings';
import { useNavigate } from 'react-router-dom-v5-compat';
import ROUTES from 'constants/routes.js';
import pluralize from 'pluralize';

function useDeletePapers({ paperIds, redirect = false, finishLoadingCallback = () => {} }) {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const deletePapers = async () => {
        const confirm = await Confirm({
            title: 'Are you sure?',
            message: `Are you sure you want to remove ${pluralize(
                'paper',
                paperIds.length,
                true
            )} from the ORKG? Deleting papers is bad practice so we encourage you to use this operation with caution!`
        });

        if (confirm) {
            setIsLoading(true);

            const promises = paperIds.map(id => {
                // set the class of paper to DeletedPapers
                const promisePaper = updateResourceClasses(id, [CLASSES.PAPER_DELETED]);
                // set the class of paper of contributions to DeletedContribution
                const promisesContributions = getStatementsBySubjectAndPredicate({
                    subjectId: id,
                    predicateId: PREDICATES.HAS_CONTRIBUTION
                }).then(contributions =>
                    Promise.all(contributions.map(contribution => updateResourceClasses(contribution.object.id, [CLASSES.CONTRIBUTION_DELETED])))
                );
                return Promise.all([promisePaper, promisesContributions]);
            });

            await Promise.all(promises);

            setIsLoading(false);
            finishLoadingCallback();

            toast.success(`Successfully deleted ${pluralize('paper', paperIds.length, true)}`);

            if (redirect) {
                navigate(ROUTES.HOME);
            }
        }
    };

    return [deletePapers, isLoading];
}
export default useDeletePapers;
