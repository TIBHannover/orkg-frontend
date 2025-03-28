import useSWR from 'swr';

import { getList, listsUrl } from '@/services/backend/lists';

const useOriginalOrder = (id: string) => {
    const { data: originalOrder, mutate: mutateOriginalOrder } = useSWR([id, listsUrl, 'getList'], ([_params]) => getList(_params));
    return { originalOrder, mutateOriginalOrder };
};

export default useOriginalOrder;
