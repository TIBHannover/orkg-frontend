import { useEffect } from 'react';
import { getObservatoryAndOrganizationInformation } from 'services/backend/observatories';
import { setProvenance, setObservatoryId, setOrganizationId } from 'slices/comparisonSlice';
import { useSelector, useDispatch } from 'react-redux';
import { MISC } from 'constants/graphSettings';
import { getConferenceAndOrganizationInformation } from 'services/backend/conferencesseries';

function useProvenance() {
    const id = useSelector(state => state.comparison.comparisonResource.id);
    const organizationId = useSelector(state => state.comparison.comparisonResource.organization_id);
    const observatoryId = useSelector(state => state.comparison.comparisonResource.observatory_id);
    const observatory = useSelector(state => state.comparison.observatory);
    const dispatch = useDispatch();

    useEffect(() => {
        /**
         * Load Provenance data
         */
        const loadProvenanceInfos = () => {
            if (observatoryId && observatoryId !== MISC.UNKNOWN_ID) {
                getObservatoryAndOrganizationInformation(observatoryId, organizationId).then(provenance => {
                    dispatch(setProvenance(provenance));
                });
            } else if (observatoryId === MISC.UNKNOWN_ID && organizationId && organizationId !== MISC.UNKNOWN_ID) {
                getConferenceAndOrganizationInformation(organizationId).then(conference => {
                    dispatch(setProvenance(conference));
                });
            } else {
                dispatch(setProvenance(null));
            }
        };
        loadProvenanceInfos();
    }, [organizationId, observatoryId, id, dispatch]);

    /**
     * Callback used on the update of observatoryId or organizationId
     */
    const updateCallBack = (_observatoryId, _organizationId) => {
        dispatch(setObservatoryId(_observatoryId));
        dispatch(setOrganizationId(_organizationId));
    };

    return {
        observatory,
        updateCallBack,
    };
}
export default useProvenance;
