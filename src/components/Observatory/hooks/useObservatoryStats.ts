import useSWR from 'swr';

import { VISIBILITY_FILTERS } from '@/constants/contentTypes';
import { getStatistics, statisticsUrl } from '@/services/backend/statistics';

type ObservatoryStats = {
    comparisons: number;
    papers: number;
};

const useObservatoryStats = ({ id }: { id: string }) => {
    const { data: observatoryStats, isLoading } = useSWR([id, statisticsUrl, 'getStatistics'], ([params]) =>
        Promise.all([
            getStatistics({ parameters: { observatory_id: params }, group: 'content-types', name: 'paper-count' }),
            getStatistics({
                parameters: { observatory_id: params, published: 'true', visibility: VISIBILITY_FILTERS.ALL_LISTED },
                group: 'content-types',
                name: 'comparison-count',
            }),
        ]),
    );

    const stats: ObservatoryStats = { comparisons: 0, papers: 0 };
    if (observatoryStats) {
        stats.papers = observatoryStats[0].value;
        stats.comparisons = observatoryStats[1].value;
    }
    return { isLoading, stats };
};

export default useObservatoryStats;
