import ContentLoader from 'components/ContentLoader/ContentLoader';
import BenchmarksCarousel from 'components/ResearchProblem/Benchmarks/BenchmarksCarousel';
import { Container } from 'reactstrap';
import { datasetsUrl, getDatasetsBenchmarksByResearchProblemId } from 'services/backend/datasets';
import useSWRInfinite from 'swr/infinite';

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

    const isEmpty = benchmarks?.[0]?.totalElements === 0;
    const isLastPageReached = isEmpty || benchmarks?.[benchmarks.length - 1]?.last;
    const hasNextPage = !isLastPageReached;

    if (benchmarks && benchmarks.map((b) => b.content).flat().length === 0 && !isLoading) {
        return null;
    }

    return (
        <>
            <Container className="d-flex align-items-center mt-4 mb-4">
                <div className="d-flex flex-md-grow-1  align-items-center">
                    <h1 className="h5 mb-0 me-2">Benchmarks</h1>
                </div>
            </Container>
            <Container className="p-0">
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
                    <ContentLoader height="100%" width="100%" viewBox="0 0 100 10" style={{ width: '100% !important' }}>
                        <rect x="0" y="0" rx="1" ry="1" width="20" height="10" />
                        <rect x="25" y="0" rx="1" ry="1" width="20" height="10" />
                        <rect x="50" y="0" rx="1" ry="1" width="20" height="10" />
                        <rect x="75" y="0" rx="1" ry="1" width="20" height="10" />
                    </ContentLoader>
                )}
            </Container>
        </>
    );
};

export default Benchmarks;
