import { getRSStatement, rosettaStoneUrl } from 'services/backend/rosettaStone';
import useSWR from 'swr';

const useRosettaStatements = ({ id }: { id: string }) => {
    const { data, isLoading, error, mutate } = useSWR(id ? [id, rosettaStoneUrl, 'getRSStatement'] : null, ([params]) => getRSStatement(params));

    return { data, isLoading, error, mutate };
};

export default useRosettaStatements;
