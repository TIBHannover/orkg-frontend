import { useState, useEffect, useCallback } from 'react';
import { getResource } from 'services/backend/resources';
import { getParentResearchFields } from 'services/backend/statements';
import { useParams } from 'react-router-dom';

function useResearchField(initialVal = {}) {
    const [data, setData] = useState({ initialVal });
    const [parentResearchFields, setParentResearchFields] = useState([]);
    const { researchFieldId } = useParams();
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isFailedLoadingData, setIsFailedLoadingData] = useState(true);

    const loadResearchFieldData = useCallback(rfId => {
        if (rfId) {
            setIsLoadingData(true);
            // Get the research field
            getResource(rfId)
                .then(result => {
                    setData({ id: rfId, label: result.label });
                    setIsLoadingData(false);
                    setIsFailedLoadingData(false);
                    document.title = `${result.label} - ORKG`;
                })
                .catch(error => {
                    setIsLoadingData(false);
                    setIsFailedLoadingData(true);
                });

            getParentResearchFields(rfId).then(result => {
                setParentResearchFields(result.reverse());
            });
        }
    }, []);

    useEffect(() => {
        if (researchFieldId !== undefined) {
            loadResearchFieldData(researchFieldId);
        }
    }, [researchFieldId, loadResearchFieldData]);
    return [data, parentResearchFields, isLoadingData, isFailedLoadingData, loadResearchFieldData];
}
export default useResearchField;
