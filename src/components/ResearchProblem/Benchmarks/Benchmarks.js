import { Container } from 'reactstrap';
import useResearchProblemBenchmarks from 'components/ResearchProblem/hooks/useResearchProblemBenchmarks';
import BenchmarksCarousel from 'components/ResearchProblem/Benchmarks/BenchmarksCarousel';
import ContentLoader from 'react-content-loader';
import PropTypes from 'prop-types';

const Benchmarks = props => {
    const { researchProblemBenchmarksData: benchmarks, isLoadingData } = useResearchProblemBenchmarks({
        researchProblemId: props.id,
    });

    if (benchmarks.length === 0 && !isLoadingData) {
        return null;
    }

    return (
        <>
            <>
                <Container className="d-flex align-items-center mt-4 mb-4">
                    <div className="d-flex flex-grow-1">
                        <h1 className="h5 flex-shrink-0 mb-0">Benchmarks</h1>
                    </div>
                </Container>
                <Container className="p-0">
                    {benchmarks.length > 0 && <BenchmarksCarousel problemId={props.id} benchmarks={benchmarks} />}
                    {isLoadingData && (
                        <>
                            <ContentLoader
                                height="100%"
                                width="100%"
                                viewBox="0 0 100 10"
                                style={{ width: '100% !important' }}
                                backgroundColor="#f3f3f3"
                                foregroundColor="#ecebeb"
                            >
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
