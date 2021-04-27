import { useState, useEffect, useCallback } from 'react';
import { getBenchmarksByResearchFieldId } from 'services/backend/benchmarks';

function useBenchmarks() {
    const [isLoading, setIsLoading] = useState(false);
    const [benchmarks, setBenchmarks] = useState([]);

    const loadBenchmarks = useCallback(page => {
        setIsLoading(true);
        getBenchmarksByResearchFieldId('R11').then(result => {
            setBenchmarks(result[0].research_problems);
            setIsLoading(false);
        });
    }, []);

    useEffect(() => {
        loadBenchmarks(0);
    }, [loadBenchmarks]);

    return { benchmarks, isLoadingBenchmarks: isLoading };
}
export default useBenchmarks;
