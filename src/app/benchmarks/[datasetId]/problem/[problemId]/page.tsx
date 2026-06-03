import { Metadata } from 'next';

import BenchmarkPage from '@/app/benchmarks/[datasetId]/problem/[problemId]/BenchmarkPage';
import { getResource } from '@/services/backend/resources';

type Props = {
    params: Promise<{ datasetId: string; problemId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { datasetId, problemId } = await params;
    const [dataset, problem] = await Promise.all([getResource(datasetId).catch(() => null), getResource(problemId).catch(() => null)]);
    return {
        title: `${problem?.label ?? 'Problem'} on ${dataset?.label ?? 'Dataset'} - Benchmark`,
    };
}

export default async function Page({ params }: Props) {
    const { datasetId, problemId } = await params;
    return <BenchmarkPage datasetId={datasetId} problemId={problemId} />;
}
