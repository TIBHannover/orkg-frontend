import { useState } from 'react';
import Confirm from 'components/Confirmation/Confirmation';
import { deleteResource as deleteResourceNetwork } from 'services/backend/resources';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import ROUTES from 'constants/routes.js';

function useDeleteResource({ resourceId, redirect = false }) {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const deleteResource = async () => {
        const confirm = await Confirm({
            title: 'Are you sure?',
            message: `Are you sure you want to delete this resource?`
        });

        if (confirm) {
            setIsLoading(true);
            try {
                await deleteResourceNetwork(resourceId);
                toast.success(`Resource deleted successfully`);

                if (redirect) {
                    navigate(ROUTES.RESOURCES);
                }
            } catch (err) {
                toast.error(`An error occurred, resource not deleted`);
                console.error(err);
            }

            setIsLoading(false);
        }
    };

    return { deleteResource, isLoading };
}
export default useDeleteResource;
