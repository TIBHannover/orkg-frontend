import { useEffect } from 'react';
import { getObservatoryAndOrganizationInformation } from 'services/backend/observatories';
import { MISC } from 'constants/graphSettings';
import { setProvenance, setObservatoryId, setOrganizationId } from 'slices/comparisonSlice';
import { useSelector, useDispatch } from 'react-redux';

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
