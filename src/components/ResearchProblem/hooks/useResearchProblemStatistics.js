import { useState, useEffect, useCallback } from 'react';
import { getResearchFieldsByResearchProblemId } from 'network';
import { useParams } from 'react-router-dom';

function useResearchProblemStatistics() {
    const [researchFields, setResearchFields] = useState([]);
    const { researchProblemId } = useParams();
    const [isLoadingResearchFields, setIsLoadingResearchFields] = useState(true);

    const loadResearchProblemStatistics = useCallback(rpId => {
        if (rpId) {
            setIsLoadingResearchFields(true);
            // Get the research fields of research problem
            getResearchFieldsByResearchProblemId(rpId).then(result => {
                setResearchFields(result);
                setIsLoadingResearchFields(false);
            });
        }
    }, []);

    useEffect(() => {
        if (researchProblemId !== undefined) {
            loadResearchProblemStatistics(researchProblemId);
        }
    }, [researchProblemId, loadResearchProblemStatistics]);
    return [researchFields, isLoadingResearchFields];
}
export default useResearchProblemStatistics;
