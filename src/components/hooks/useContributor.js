import { useEffect, useState } from 'react';
import { getContributorInformationById } from 'services/backend/contributors';

const useContributor = ({ userId }) => {
    const [contributor, setContributor] = useState(null);
    const [isLoadingContributor, setIsLoadingContributor] = useState(true);

    useEffect(() => {
        if (userId) {
            setIsLoadingContributor(true);
            getContributorInformationById(userId)
                .then(result => {
                    setContributor(result);
                    setIsLoadingContributor(false);
                })
                .catch(() => {
                    setContributor(null);
                    setIsLoadingContributor(false);
                });
        }
    }, [userId]);

    return { contributor, isLoadingContributor };
};

export default useContributor;
