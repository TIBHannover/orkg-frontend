import { useCallback, useEffect, useState } from 'react';
import { getObservatoryStatsById } from 'services/backend/stats';

const useObservatoryStats = ({ id }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [stats, setStats] = useState({});

    const loadObservatoryStats = useCallback(oId => {
        if (oId) {
            setIsLoading(true);
            // Get the observatory stats
            getObservatoryStatsById(oId)
                .then(result => {
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
