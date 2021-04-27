import { useState, useEffect, useCallback } from 'react';
import { getBenchmarksByResearchFieldId } from 'services/backend/benchmarks';

function useBenchmarks() {
    const pageSize = 16;
    const [isLoading, setIsLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const [page, setPage] = useState(1);
    const [benchmarks, setBenchmarks] = useState([]);

    const loadBenchmarks = useCallback(page => {
        setIsLoading(true);
        getBenchmarksByResearchFieldId('R11').then(result => {
            console.log(result[0].research_problems);
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
