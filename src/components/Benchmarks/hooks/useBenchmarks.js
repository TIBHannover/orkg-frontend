import { useState, useEffect, useCallback } from 'react';
import { getAllBenchmarks } from 'services/backend/benchmarks';

function useBenchmarks() {
    const [isLoading, setIsLoading] = useState(false);
    const [benchmarks, setBenchmarks] = useState([]);

    const loadBenchmarks = useCallback(page => {
        setIsLoading(true);
        getAllBenchmarks().then(result => {
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
