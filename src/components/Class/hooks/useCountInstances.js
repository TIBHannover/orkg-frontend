import { useEffect, useState } from 'react';
import { getCountInstances } from 'services/backend/classes';

const useCountInstances = id => {
    const [isLoading, setIsLoading] = useState(false);
    const [countInstances, setCountInstances] = useState(0);

    useEffect(() => {
        const getCount = async () => {
            setIsLoading(true);

            const count = await getCountInstances(id);
            setCountInstances(count.count);
            setIsLoading(false);
        };
        getCount();
    }, [id]);

    return { countInstances, isLoading };
};

export default useCountInstances;
