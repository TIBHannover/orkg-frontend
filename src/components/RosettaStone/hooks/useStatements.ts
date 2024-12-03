import { getRSStatements, rosettaStoneUrl } from 'services/backend/rosettaStone';
import useSWR from 'swr';

const useStatements = ({ context }: { context: string }) => {
    const {
        data: statements,
        isLoading,
        mutate,
    } = useSWR(context ? [{ context }, rosettaStoneUrl, 'getRSStatements'] : null, ([params]) => getRSStatements(params));

    return { statements, isLoading, mutate };
};
export default useStatements;
