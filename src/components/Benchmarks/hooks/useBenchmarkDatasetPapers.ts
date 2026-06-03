import { DatasetSummaryRepresentation } from '@orkg/orkg-client';
import { groupBy, sortBy } from 'lodash';
import { useMemo } from 'react';
import useSWR from 'swr';

import { datasetsUrl, findAllDatasetSummariesByIdAndResearchProblemId, getResearchProblemsByDatasetId } from '@/services/backend/datasets';

type UseBenchmarkDatasetPapersParams = {
    datasetId: string;
    problemId: string;
};

const useBenchmarkDatasetPapers = ({ datasetId, problemId }: UseBenchmarkDatasetPapersParams) => {
    const {
        data: benchmarkData,
        error: benchmarkError,
        isLoading: isLoadingBenchmarks,
    } = useSWR(
        datasetId && problemId
            ? [{ id: datasetId, researchProblemId: problemId, size: 9999 }, datasetsUrl, 'findAllDatasetSummariesByIdAndResearchProblemId']
            : null,
        ([params]) => findAllDatasetSummariesByIdAndResearchProblemId(params),
    );

    const {
        data: problemsData,
        error: problemsError,
        isLoading: isLoadingProblems,
    } = useSWR(datasetId ? [{ id: datasetId, size: 9999 }, datasetsUrl, 'getResearchProblemsByDatasetId'] : null, ([params]) =>
        getResearchProblemsByDatasetId(params),
    );

    const { benchmarkDatasetPapers, metrics } = useMemo<{
        benchmarkDatasetPapers: Record<string, DatasetSummaryRepresentation[]>;
        metrics: string[];
    }>(() => {
        if (!benchmarkData) {
            return {
                benchmarkDatasetPapers: {},
                metrics: [],
            };
        }

        const trimResult = sortBy(
            benchmarkData.content.map((item) => ({
                ...item,
                metric: item.metric.trim(),
            })),
            ['paper_year', 'paper_month'],
        );
        const grouped = groupBy(trimResult, 'metric');

        return {
            benchmarkDatasetPapers: grouped,
            metrics: Object.keys(grouped),
        };
    }, [benchmarkData]);

    const datasetProblems = problemsData?.content ?? [];

    const isLoading = isLoadingBenchmarks || isLoadingProblems;

    return {
        benchmarkDatasetPapers,
        datasetProblems,
        metrics,
        isLoading,
        isFailedLoadingPapers: !!benchmarkError || !!problemsError,
    };
};

export default useBenchmarkDatasetPapers;
