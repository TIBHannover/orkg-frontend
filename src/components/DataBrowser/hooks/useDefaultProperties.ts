import useSWR from 'swr';

import { getPredicate, predicatesUrl } from '@/services/backend/predicates';

const useDefaultProperties = ({ ids }: { ids: string[] }) => {
    const { data: predicates, isLoading } = useSWR(ids ? [ids, predicatesUrl, 'getPredicate'] : null, ([params]) =>
        Promise.all(params.map((id) => getPredicate(id))),
    );

    return { predicates, isLoading };
};
export default useDefaultProperties;
