import { useState, useEffect, useCallback } from 'react';
import { getResearchFieldsByResearchProblemId } from 'services/backend/problems';
import { useParams } from 'react-router-dom';

function useResearchProblemResearchFields() {
    const [researchFields, setResearchFields] = useState([]);
    const { researchProblemId } = useParams();
    const [isLoadingResearchFields, setIsLoadingResearchFields] = useState(true);

    const loadResearchProblemResearchFields = useCallback(rpId => {
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
            loadResearchProblemResearchFields(researchProblemId);
        }
    }, [researchProblemId, loadResearchProblemResearchFields]);
    return [researchFields, isLoadingResearchFields];
}
export default useResearchProblemResearchFields;
