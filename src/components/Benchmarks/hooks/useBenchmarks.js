import { useState, useEffect, useCallback } from 'react';
import { getBenchmarksByResearchFieldId } from 'services/backend/benchmarks';

const RESEARCH_FIELD = 'R132';

function useBenchmarks() {
    const [isLoading, setIsLoading] = useState(false);
    const [benchmarks, setBenchmarks] = useState([]);

    const loadBenchmarks = useCallback(page => {
        setIsLoading(true);
        getBenchmarksByResearchFieldId(RESEARCH_FIELD).then(result => {
            setBenchmarks(result);
            setIsLoading(false);
        });
    }, []);

    useEffect(() => {
        loadBenchmarks(0);
    }, [loadBenchmarks]);

    return { benchmarks, isLoadingBenchmarks: isLoading };
}
export default useBenchmarks;
