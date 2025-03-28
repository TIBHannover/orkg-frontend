import useSWR from 'swr';

import { getRSTemplate, rosettaStoneUrl } from '@/services/backend/rosettaStone';

const useRosettaTemplate = ({ id }: { id: string }) => {
    const { data, isLoading } = useSWR(id ? [id, rosettaStoneUrl, 'getRSTemplate'] : null, ([params]) => getRSTemplate(params));

    return { data, isLoading };
};
export default useRosettaTemplate;
