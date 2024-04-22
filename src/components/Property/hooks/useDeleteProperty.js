import { useState } from 'react';
import Confirm from 'components/Confirmation/Confirmation';
import { deletePredicate as deletePredicateNetwork } from 'services/backend/predicates';
import { toast } from 'react-toastify';
import useRouter from 'components/NextJsMigration/useRouter';
import ROUTES from 'constants/routes.js';

function useDeleteProperty({ propertyId, redirect = false }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const deleteProperty = async () => {
        const confirm = await Confirm({
            title: 'Are you sure?',
            message: 'Are you sure you want to delete this property?',
        });

        if (confirm) {
            setIsLoading(true);
            try {
                await deletePredicateNetwork(propertyId);
                toast.success('Property deleted successfully');

                if (redirect) {
                    router.push(ROUTES.PROPERTIES);
                }
            } catch (err) {
                toast.error(err.message);
            }

            setIsLoading(false);
        }
    };

    return { deleteProperty, isLoading };
}
export default useDeleteProperty;
