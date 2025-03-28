import { useCallback, useEffect, useState } from 'react';

import { getObservatoryStatsById } from '@/services/backend/stats';

type ObservatoryStats = {
    comparisons: number;
    papers: number;
};

export const useObservatoryStats = ({ id }: { id: string }) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [stats, setStats] = useState<ObservatoryStats>({ comparisons: 0, papers: 0 });

    const loadObservatoryStats = useCallback((oId: string) => {
        if (oId) {
            setIsLoading(true);
            // Get the observatory stats
            getObservatoryStatsById(oId)
                .then((result) => {
                    setStats(result);
                    setIsLoading(false);
                })
                .catch(() => {
                    setIsLoading(false);
                });
        }
    }, []);

    useEffect(() => {
        if (id !== undefined) {
            loadObservatoryStats(id);
        }
    }, [id, loadObservatoryStats]);

    return { isLoading, stats };
};

export default useObservatoryStats;
