import { useState, useEffect, useCallback } from 'react';
import { getDatasetBenchmarksByDatasetId } from 'services/backend/datasets';
import { groupBy } from 'lodash';

// Loading summary for a dataset
function useBenchmarkDatasetPapers({ datasetId }) {
    const [benchmarkDatasetPapers, setBenchmarkDatasetPapers] = useState({});
    const [metrics, setMetrics] = useState([]);
    const [selectedMetric, setSelectedMetric] = useState(null);
    const [selectedMetricVisualization, setSelectedMetricVisualization] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFailedLoading, setIsFailedLoading] = useState(false);

    const loadBenchmarkDatasetPapers = useCallback(() => {
        setIsLoading(true);
        setIsFailedLoading(false);
        return getDatasetBenchmarksByDatasetId(datasetId)
            .then(result => {
                setBenchmarkDatasetPapers(groupBy(result, 'metric'));
                setMetrics(Object.keys(groupBy(result, 'metric')));
                setSelectedMetric(Object.keys(groupBy(result, 'metric'))[0]);
                setSelectedMetricVisualization(Object.keys(groupBy(result, 'metric'))[0]);
                setIsLoading(false);
                setIsFailedLoading(false);
            })
            .catch(() => {
                setMetrics([]);
                setBenchmarkDatasetPapers({});
                setIsLoading(false);
                setIsFailedLoading(true);
            });
    }, [datasetId]);

    useEffect(() => {
        if (datasetId) {
            loadBenchmarkDatasetPapers(datasetId);
        }
    }, [datasetId, loadBenchmarkDatasetPapers]);

    return {
        benchmarkDatasetPapers,
        metrics,
        selectedMetric,
        selectedMetricVisualization,
        isLoading,
        isFailedLoading,
        setSelectedMetric,
        setSelectedMetricVisualization
    };
}

export default useBenchmarkDatasetPapers;
