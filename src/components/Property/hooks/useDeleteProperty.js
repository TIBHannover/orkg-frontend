import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';

import Confirm from '@/components/Confirmation/Confirmation';
import ROUTES from '@/constants/routes';
import { deletePredicate as deletePredicateNetwork } from '@/services/backend/predicates';

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
