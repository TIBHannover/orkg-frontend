import { Skeleton } from '@heroui/react';
import { DatasetsApiFindAllDatasetsByResearchProblemIdRequest } from '@orkg/orkg-client';
import useSWRInfinite from 'swr/infinite';

import BenchmarksCarousel from '@/components/ResearchProblem/Benchmarks/BenchmarksCarousel';
import Container from '@/components/Ui/Structure/Container';
import { datasetsUrl, findAllDatasetsByResearchProblemId } from '@/services/backend/datasets';

type BenchmarksProps = {
    id: string;
};

const Benchmarks = ({ id }: BenchmarksProps) => {
    const getKey = (pageIndex: number): DatasetsApiFindAllDatasetsByResearchProblemIdRequest => ({
        id,
        page: pageIndex,
        size: 6,
    });

    const {
        data: benchmarks,
        isLoading,
        isValidating,
        size: page,
        setSize,
    } = useSWRInfinite(
        (pageIndex) => [getKey(pageIndex), datasetsUrl, 'findAllDatasetsByResearchProblemId'],
        ([params]) => findAllDatasetsByResearchProblemId(params),
        { revalidateIfStale: true, revalidateOnFocus: true, revalidateOnReconnect: true },
    );

    const lastPage = benchmarks?.[benchmarks.length - 1]?.page;
    const hasNextPage = lastPage ? lastPage.number < lastPage.totalPages - 1 : false;

    if (benchmarks && benchmarks.map((b) => b.content).flat().length === 0 && !isLoading) {
        return null;
    }

    return (
        <>
            <Container className="flex items-center mt-6 mb-6">
                <div className="flex md:grow items-center">
                    <h1 className="text-xl mb-0 mr-2">Benchmarks</h1>
                </div>
            </Container>
            <Container>
                <BenchmarksCarousel
                    problemId={id}
                    benchmarks={[...(benchmarks?.map((_content) => _content.content).flat() ?? [])]}
                    isLoading={isLoading || isValidating}
                    hasNextPage={hasNextPage}
                    loadNextPage={() => setSize(page + 1)}
                />

                {isLoading && (
                    <div className="flex gap-4">
                        <Skeleton className="w-1/5 h-10 rounded" />
                        <Skeleton className="w-1/5 h-10 rounded" />
                        <Skeleton className="w-1/5 h-10 rounded" />
                        <Skeleton className="w-1/5 h-10 rounded" />
                    </div>
                )}
            </Container>
        </>
    );
};

export default Benchmarks;
