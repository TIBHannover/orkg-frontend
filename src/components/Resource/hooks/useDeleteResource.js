import { useState } from 'react';
import Confirm from 'reactstrap-confirm';
import { deleteResource as deleteResourceNetwork } from 'network';
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom';
import ROUTES from 'constants/routes.js';

function useDeleteResource({ resourceId, redirect = false }) {
    const history = useHistory();
    const [isLoading, setIsLoading] = useState(false);

    const deleteResource = async () => {
        const confirm = await Confirm({
            title: 'Are you sure?',
            message: `Are you sure you want to delete this resource?`,
            cancelColor: 'light'
        });

        if (confirm) {
            setIsLoading(true);
            try {
                await deleteResourceNetwork(resourceId);
                toast.success(`Successfully delete this resource`);

                if (redirect) {
                    history.push(ROUTES.HOME);
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
