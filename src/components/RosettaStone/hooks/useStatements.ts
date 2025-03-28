import useSWR from 'swr';

import { getRSStatements, rosettaStoneUrl } from '@/services/backend/rosettaStone';

const useStatements = ({ context }: { context: string }) => {
    const {
        data: statements,
        isLoading,
        mutate,
    } = useSWR(context ? [{ context }, rosettaStoneUrl, 'getRSStatements'] : null, ([params]) => getRSStatements(params));

    return { statements, isLoading, mutate };
};
export default useStatements;
