import useSWR from 'swr';
import { getContributorInformationById, contributorsUrl } from 'services/backend/contributors';
import { MISC } from 'constants/graphSettings';

const useContributor = ({ userId }: { userId?: string }) => {
    const { data: contributor, isLoading } = useSWR(
        userId && userId !== MISC.UNKNOWN_ID ? [userId, contributorsUrl, 'getContributorInformationById'] : null,
        ([params]) => getContributorInformationById(params),
    );

    return {
        contributor,
        isLoadingContributor: isLoading,
    };
};

export default useContributor;
