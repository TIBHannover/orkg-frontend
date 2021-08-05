import { useState, useEffect, useCallback } from 'react';
import { getDatasetBenchmarksByDatasetId, getResearchProblemsByDatasetId } from 'services/backend/datasets';
import { groupBy, sortBy } from 'lodash';

// Loading summary for a dataset
function useBenchmarkDatasetPapers({ datasetId, problemId }) {
    const [benchmarkDatasetPapers, setBenchmarkDatasetPapers] = useState({});
    const [datasetProblems, setDatasetProblems] = useState({});
    const [metrics, setMetrics] = useState([]);
    const [selectedMetric, setSelectedMetric] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFailedLoadingPapers, setIsFailedLoadingPapers] = useState(false);

    const loadBenchmarkDatasetPapers = useCallback(() => {
        setIsLoading(true);
        setIsFailedLoadingPapers(false);
        return Promise.all([getDatasetBenchmarksByDatasetId(datasetId, problemId), getResearchProblemsByDatasetId(datasetId)])
            .then(([benchmark, problems]) => {
                // TODO: this trim needs to be done on the data itself
                let trimResult = benchmark.map(s => {
                    s.metric = s.metric.trim();
                    return s;
                });
                trimResult = sortBy(trimResult, ['paper_year', 'paper_month']);
                setBenchmarkDatasetPapers(groupBy(trimResult, 'metric'));
                setMetrics(Object.keys(groupBy(trimResult, 'metric')));
                setDatasetProblems(problems);
                setSelectedMetric(Object.keys(groupBy(trimResult, 'metric'))[0]);
                setIsLoading(false);
                setIsFailedLoadingPapers(false);
            })
            .catch(() => {
                setMetrics([]);
                setDatasetProblems([]);
                setBenchmarkDatasetPapers({});
                setIsLoading(false);
                setIsFailedLoadingPapers(true);
            });
    }, [datasetId, problemId]);

    useEffect(() => {
        setBenchmarkDatasetPapers({});
        setDatasetProblems({});
        setMetrics([]);
        setSelectedMetric(null);
        setIsLoading(false);
        setIsFailedLoadingPapers(false);
        loadBenchmarkDatasetPapers();
    }, [loadBenchmarkDatasetPapers]);

    return {
        benchmarkDatasetPapers,
        datasetProblems,
        metrics,
        selectedMetric,
        isLoading,
        isFailedLoadingPapers,
        setSelectedMetric
    };
}

export default useBenchmarkDatasetPapers;
