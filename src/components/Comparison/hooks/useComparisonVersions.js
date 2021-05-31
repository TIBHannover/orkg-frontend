import { useEffect, useState } from 'react';
import { getComparisonVersionsById } from 'services/backend/comparisons';

function useComparisonVersions({ comparisonId }) {
    const [isLoading, setIsLoading] = useState(false);
    const [versions, setVersions] = useState([]);

    useEffect(() => {
        setIsLoading(true);
        getComparisonVersionsById(comparisonId).then(v => {
            setVersions(v);
            setIsLoading(false);
        });
    }, [comparisonId]);

    return {
        versions,
        isLoading
    };
}
export default useComparisonVersions;
