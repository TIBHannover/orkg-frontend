import useSWR from 'swr';

import { classesUrl, getCountInstances } from '@/services/backend/classes';

const useCountInstances = (id: string | undefined) => {
    const { data: countInstances, isLoading } = useSWR(id ? [id, classesUrl, 'getCountInstances'] : null, ([params]) => getCountInstances(params));

    return { countInstances: countInstances?.count ?? 0, isLoading };
};

export default useCountInstances;
