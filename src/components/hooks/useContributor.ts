import useSWR from 'swr';

import { MISC } from '@/constants/graphSettings';
import { contributorsUrl, getContributorById } from '@/services/backend/contributors';

const useContributor = ({ userId }: { userId?: string }) => {
    const { data: contributor, isLoading } = useSWR(
        userId && userId !== MISC.UNKNOWN_ID ? [userId, contributorsUrl, 'getContributorById'] : null,
        ([params]) => getContributorById(params),
        { shouldRetryOnError: false },
    );
    return {
        contributor,
        isLoadingContributor: isLoading,
    };
};

export default useContributor;
