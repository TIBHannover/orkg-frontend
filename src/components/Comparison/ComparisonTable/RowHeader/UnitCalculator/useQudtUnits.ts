import useSWR from 'swr';

import { getQudtData, qudtUnitsUrl } from '@/services/qudt';
import { QuantityUnitItem } from '@/services/qudt/types';

const useQudtUnits = (enabled: boolean) => {
    const { data: qudtUnits = [], isLoading } = useSWR<QuantityUnitItem[]>(
        enabled ? [null, qudtUnitsUrl, 'getQudtData'] : null,
        () => getQudtData(),
        { revalidateOnFocus: false, revalidateOnReconnect: false },
    );

    return { qudtUnits, isLoading };
};

export default useQudtUnits;
