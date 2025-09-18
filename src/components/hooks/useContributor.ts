import useSWR from 'swr';

import { MISC } from '@/constants/graphSettings';
import { contributorsUrl, getContributorInformationById } from '@/services/backend/contributors';

const useContributor = ({ userId }: { userId?: string }) => {
    const { data: contributor, isLoading } = useSWR(
        userId && userId !== MISC.UNKNOWN_ID ? [userId, contributorsUrl, 'getContributorInformationById'] : null,
        ([params]) => getContributorInformationById(params),
        { shouldRetryOnError: false },
    );
    return {
        contributor,
        isLoadingContributor: isLoading,
    };
};

export default useContributor;
