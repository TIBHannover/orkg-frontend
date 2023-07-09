import { RESOURCES } from 'constants/graphSettings';
import { useCallback, useEffect, useState } from 'react';
import { getObservatories } from 'services/backend/observatories';

function useResearchFieldObservatories({ researchFieldId }) {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFailedLoading, setIsFailedLoading] = useState(true);

    const loadResearchFieldObservatories = useCallback(rfId => {
        if (rfId) {
            setIsLoading(true);
            const observatories = getObservatories({ researchFieldId: rfId !== RESOURCES.RESEARCH_FIELD_MAIN ? rfId : null }).then(
                res => res.content,
            );

            observatories
                .then(_data => {
                    setData(_data);
                    setIsLoading(false);
                    setIsFailedLoading(false);
                })
                .catch(() => {
                    setIsLoading(false);
                    setIsFailedLoading(true);
                });
        }
    }, []);

    useEffect(() => {
        setData([]);
        if (researchFieldId !== undefined) {
            loadResearchFieldObservatories(researchFieldId);
        }
    }, [researchFieldId, loadResearchFieldObservatories]);
    return [data, isLoading, isFailedLoading];
}

export default useResearchFieldObservatories;
