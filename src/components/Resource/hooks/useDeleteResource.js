import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';

import Confirm from '@/components/Confirmation/Confirmation';
import ROUTES from '@/constants/routes';
import { deleteResource as deleteResourceNetwork } from '@/services/backend/resources';

function useDeleteResource({ resourceId, redirect = false }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const deleteResource = async () => {
        const confirm = await Confirm({
            title: 'Are you sure?',
            message: 'Are you sure you want to delete this resource?',
        });

        if (confirm) {
            setIsLoading(true);
            try {
                await deleteResourceNetwork(resourceId);
                toast.success('Resource deleted successfully');

                if (redirect) {
                    router.push(ROUTES.RESOURCES);
                }
            } catch (err) {
                console.error(err);
                toast.error(err.message);
            }

            setIsLoading(false);
        }
    };

    return { deleteResource, isLoading };
}
export default useDeleteResource;
