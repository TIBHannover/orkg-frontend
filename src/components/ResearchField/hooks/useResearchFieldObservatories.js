import { useState, useEffect, useCallback } from 'react';
import { getObservatoriesByResearchFieldId } from 'services/backend/observatories';
import { useParams } from 'react-router-dom';

function useResearchFieldObservatories() {
    const [data, setData] = useState([]);
    const { researchFieldId } = useParams();
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isFailedLoadingData, setIsFailedLoadingData] = useState(true);

    const loadResearchFieldObservatories = useCallback(rfId => {
        if (rfId) {
            setIsLoadingData(true);
            // Get the observatories
            getObservatoriesByResearchFieldId(rfId)
                .then(result => {
                    setData(result ?? []);
                    setIsLoadingData(false);
                    setIsFailedLoadingData(false);
                })
                .catch(error => {
                    setData([]);
                    setIsLoadingData(false);
                    setIsFailedLoadingData(true);
                });
        }
    }, []);

    useEffect(() => {
        if (researchFieldId !== undefined) {
            loadResearchFieldObservatories(researchFieldId);
        }
    }, [researchFieldId, loadResearchFieldObservatories]);
    return [data, isLoadingData, isFailedLoadingData, loadResearchFieldObservatories];
}
export default useResearchFieldObservatories;
