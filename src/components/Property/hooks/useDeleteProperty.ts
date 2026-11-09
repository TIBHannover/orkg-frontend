import { toast } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import Confirm from '@/components/Confirmation/Confirmation';
import ROUTES from '@/constants/routes';
import { deletePredicate as deletePredicateNetwork } from '@/services/backend/predicates';
import { getBackendErrorMessage } from '@/services/backend/problemDetails';

type UseDeletePropertyParams = {
    propertyId: string;
    redirect?: boolean;
};

const useDeleteProperty = ({
    propertyId,
    redirect = false,
}: UseDeletePropertyParams): { deleteProperty: () => Promise<void>; isLoading: boolean } => {
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
                toast.danger(await getBackendErrorMessage(err, 'Something went wrong while deleting the property'));
            }

            setIsLoading(false);
        }
    };

    return { deleteProperty, isLoading };
};
export default useDeleteProperty;
