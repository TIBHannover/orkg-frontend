import { useState } from 'react';
import { CLASSES } from 'constants/graphSettings';
import Confirm from 'reactstrap-confirm';
import { updateResourceClasses, getStatementsBySubjectAndPredicate } from 'network';
import { toast } from 'react-toastify';
import { PREDICATES } from 'constants/graphSettings';
import { useHistory } from 'react-router-dom';
import ROUTES from 'constants/routes.js';

function useDeletePapers({ paperIds, redirect = false, finishLoadingCallback = () => {} }) {
    const history = useHistory();
    const [isLoading, setIsLoading] = useState(false);

    const deletePapers = async () => {
        const confirm = await Confirm({
            title: 'Are you sure?',
            message: `Are you sure you want to remove ${paperIds.length} paper${paperIds.length !== 1 ? 's' : ''} 
            from the ORKG? Deleting papers is bad practice so we encourage you to use this operation with caution!`,
            cancelColor: 'light'
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

            toast.success(`Successfully deleted ${paperIds.length} paper${paperIds.length !== 1 ? 's' : ''}`);

            if (redirect) {
                history.push(ROUTES.HOME);
            }
        }
    };

    return [deletePapers, isLoading];
}
export default useDeletePapers;
