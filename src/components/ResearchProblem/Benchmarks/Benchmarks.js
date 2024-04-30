import usePaginate from 'components/hooks/usePaginate';
import BenchmarksCarousel from 'components/ResearchProblem/Benchmarks/BenchmarksCarousel';
import PropTypes from 'prop-types';
import ContentLoader from 'components/ContentLoader/ContentLoader';
import { Container } from 'reactstrap';
import { getDatasetsBenchmarksByResearchProblemId } from 'services/backend/datasets';

const Benchmarks = (props) => {
    const fetchItems = async ({ id, page, pageSize }) => {
        const { content: items, last, totalElements } = await getDatasetsBenchmarksByResearchProblemId({ id, page, size: pageSize });
        return {
            items,
            last,
            totalElements,
        };
    };

    const {
        results: benchmarks,
        isLoading,
        isLastPageReached,
        hasNextPage,
        page,
        loadNextPage,
        handleKeyDown,
    } = usePaginate({
        fetchItems,
        fetchItemsExtraParams: { id: props.id },
        pageSize: 6,
    });

    if (benchmarks.length === 0 && !isLoading) {
        return null;
    }

    return (
        <>
            <>
                <Container className="d-flex align-items-center mt-4 mb-4">
                    <div className="d-flex flex-md-grow-1  align-items-center">
                        <h1 className="h5 mb-0 me-2">Benchmarks</h1>
                    </div>
                </Container>
                <Container className="p-0">
                    <BenchmarksCarousel
                        problemId={props.id}
                        benchmarks={benchmarks}
                        isLoading={isLoading}
                        isLastPageReached={isLastPageReached}
                        hasNextPage={hasNextPage}
                        loadNextPage={loadNextPage}
                        handleKeyDown={handleKeyDown}
                        page={page}
                    />

                    {isLoading && page === 0 && (
                        <>
                            <ContentLoader height="100%" width="100%" viewBox="0 0 100 10" style={{ width: '100% !important' }}>
                                <rect x="0" y="0" rx="1" ry="1" width="20" height="10" />
                                <rect x="25" y="0" rx="1" ry="1" width="20" height="10" />
                                <rect x="50" y="0" rx="1" ry="1" width="20" height="10" />
                                <rect x="75" y="0" rx="1" ry="1" width="20" height="10" />
                            </ContentLoader>
                        </>
                    )}
                </Container>
            </>
        </>
    );
};

Benchmarks.propTypes = {
    id: PropTypes.string.isRequired,
};

export default Benchmarks;
