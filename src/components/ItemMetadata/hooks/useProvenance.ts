import useSWR from 'swr';

import { MISC } from '@/constants/graphSettings';
import { getObservatoryById, observatoriesUrl } from '@/services/backend/observatories';
import { getOrganization, organizationsUrl } from '@/services/backend/organizations';

function useProvenance({ orgId, obsId }: { orgId?: string; obsId?: string }) {
    const { data: observatory } = useSWR(obsId && obsId !== MISC.UNKNOWN_ID ? [obsId, observatoriesUrl, 'getObservatoryById'] : null, ([params]) =>
        getObservatoryById(params),
    );

    const { data: organization } = useSWR(orgId && orgId !== MISC.UNKNOWN_ID ? [orgId, organizationsUrl, 'getOrganization'] : null, ([params]) =>
        getOrganization(params),
    );

    return { observatory, organization };
}
export default useProvenance;
