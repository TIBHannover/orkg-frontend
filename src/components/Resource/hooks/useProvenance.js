import { useEffect, useState } from 'react';

import { MISC } from '@/constants/graphSettings';
import { getObservatoryAndOrganizationInformation } from '@/services/backend/observatories';

function useProvenance({ orgId, obsId }) {
    const [provenance, setProvenance] = useState(null);
    const [observatoryId, setObservatoryId] = useState(obsId);
    const [organizationId, setOrganizationId] = useState(orgId);

    useEffect(() => {
        /**
         * Load Provenance data
         */
        const loadProvenanceInfos = () => {
            if (observatoryId && observatoryId !== MISC.UNKNOWN_ID && organizationId && organizationId !== MISC.UNKNOWN_ID) {
                getObservatoryAndOrganizationInformation(observatoryId, organizationId).then((p) => {
                    setProvenance(p);
                });
            } else {
                setProvenance(null);
            }
        };
        loadProvenanceInfos();
    }, [organizationId, observatoryId]);

    /**
     * Callback used on the update of observatoryId or organizationId
     */
    const updateCallBack = (_observatoryId, _organizationId) => {
        setObservatoryId(_observatoryId);
        setOrganizationId(_organizationId);
    };

    return { observatoryId, organizationId, provenance, updateCallBack };
}
export default useProvenance;
