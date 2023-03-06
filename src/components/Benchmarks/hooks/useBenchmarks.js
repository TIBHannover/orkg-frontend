import { useState, useEffect, useCallback } from 'react';
import { getAllBenchmarks } from 'services/backend/benchmarks';
import { toast } from 'react-toastify';

function useBenchmarks() {
    const [isLoading, setIsLoading] = useState(false);
    const [benchmarks, setBenchmarks] = useState([]);

    const loadBenchmarks = useCallback(() => {
        setIsLoading(true);
        getAllBenchmarks()
            .then(result => {
                setBenchmarks(result);
                setIsLoading(false);
            })
            .catch(() => {
                toast.error('Error loading Benchmarks');
                setIsLoading(false);
            });
    }, []);

    useEffect(() => {
        loadBenchmarks();
    }, [loadBenchmarks]);

    return { benchmarks, isLoadingBenchmarks: isLoading };
}
export default useBenchmarks;
