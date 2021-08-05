import { useState, useEffect, useCallback } from 'react';
import { getDatasetsBenchmarksByResearchProblemId } from 'services/backend/datasets';

function useResearchProblemBenchmarks({ researchProblemId }) {
    const [researchProblemBenchmarksData, setResearchProblemBenchmarks] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [isFailedLoadingData, setIsFailedLoadingData] = useState(false);

    const loadResearchProblemBenchmarks = useCallback(rpId => {
        if (rpId) {
            setIsLoadingData(true);
            getDatasetsBenchmarksByResearchProblemId(rpId)
                .then(result => {
                    setResearchProblemBenchmarks(result);
                    setIsLoadingData(false);
                })
                .catch(e => {
                    setIsLoadingData(false);
                    setIsFailedLoadingData(true);
                });
        }
    }, []);

    useEffect(() => {
        if (researchProblemId !== undefined) {
            loadResearchProblemBenchmarks(researchProblemId);
        }
    }, [researchProblemId, loadResearchProblemBenchmarks]);
    return { researchProblemBenchmarksData, isLoadingData, isFailedLoadingData };
}

export default useResearchProblemBenchmarks;
