import useSWR from 'swr';

import useAuthentication from '@/components/hooks/useAuthentication';
import { getUserInformation, userUrl } from '@/services/backend/users';

const useMembership = () => {
    const { user } = useAuthentication();
    const { data: membership } = useSWR(user ? [null, userUrl, 'getUserInformation'] : null, () => getUserInformation());

    return {
        organizationId: membership?.organizationId,
        observatoryId: membership?.observatoryId,
        displayName: membership?.displayName,
    };
};

export default useMembership;
