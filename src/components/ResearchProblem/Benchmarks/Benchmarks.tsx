import { Skeleton } from '@heroui/react';
import useSWRInfinite from 'swr/infinite';

import BenchmarksCarousel from '@/components/ResearchProblem/Benchmarks/BenchmarksCarousel';
import Container from '@/components/Ui/Structure/Container';
import { datasetsUrl, getDatasetsBenchmarksByResearchProblemId } from '@/services/backend/datasets';

type BenchmarksProps = {
    id: string;
};

const Benchmarks = ({ id }: BenchmarksProps) => {
    const getKey = (pageIndex: number): any => ({
        id,
        page: pageIndex,
        size: 6,
    });

    const {
        data: benchmarks,
        isLoading,
        size: page,
        setSize,
    } = useSWRInfinite(
        (pageIndex) => [getKey(pageIndex), datasetsUrl, 'getDatasetsBenchmarksByResearchProblemId'],
        ([params]) => getDatasetsBenchmarksByResearchProblemId(params),
        { revalidateIfStale: true, revalidateOnFocus: true, revalidateOnReconnect: true },
    );

    const isEmpty = benchmarks?.[0]?.page?.total_elements === 0;
    const isLastPageReached =
        isEmpty || benchmarks?.[benchmarks.length - 1]?.page?.number === (benchmarks?.[benchmarks.length - 1]?.page?.total_pages || 0) - 1;
    const hasNextPage = !isLastPageReached;

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
                    isLoading={isLoading}
                    isLastPageReached={isLastPageReached ?? false}
                    hasNextPage={hasNextPage}
                    loadNextPage={() => setSize(page + 1)}
                    handleKeyDown={() => setSize(page + 1)}
                    page={page}
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
