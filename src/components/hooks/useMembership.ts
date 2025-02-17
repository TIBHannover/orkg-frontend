import useAuthentication from 'components/hooks/useAuthentication';
import { getUserInformation, userUrl } from 'services/backend/users';
import useSWR from 'swr';

const useMembership = () => {
    const { user } = useAuthentication();
    const { data: membership } = useSWR(user ? [null, userUrl, 'getUserInformation'] : null, () => getUserInformation());

    return {
        organizationId: membership?.organization_id,
        observatoryId: membership?.observatory_id,
        displayName: membership?.display_name,
    };
};

export default useMembership;
