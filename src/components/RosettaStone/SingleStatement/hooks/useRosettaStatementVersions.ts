import { getRSStatementVersions, rosettaStoneUrl } from 'services/backend/rosettaStone';
import useSWR from 'swr';

const useRosettaStatementVersions = ({ id }: { id: string }) => {
    const { data, isLoading } = useSWR(id ? [{ id }, rosettaStoneUrl, 'getRSStatementVersions'] : null, ([params]) => getRSStatementVersions(params));

    return { data, isLoading };
};
export default useRosettaStatementVersions;
