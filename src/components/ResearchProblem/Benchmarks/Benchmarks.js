import { Container } from 'reactstrap';
import useResearchProblemBenchmarks from 'components/ResearchProblem/hooks/useResearchProblemBenchmarks';
import BenchmarksCarousel from 'components/ResearchProblem/Benchmarks/BenchmarksCarousel';
import PropTypes from 'prop-types';

const Benchmarks = props => {
    const { researchProblemBenchmarksData: benchmarks } = useResearchProblemBenchmarks({ researchProblemId: props.id });
    if (benchmarks.length > 0) {
        return (
            <>
                <Container className="d-flex align-items-center mt-4 mb-4">
                    <div className="d-flex flex-grow-1">
                        <h1 className="h5 flex-shrink-0 mb-0">Benchmarks</h1>
                    </div>
                </Container>
                <Container className="p-0">
                    <BenchmarksCarousel benchmarks={benchmarks} />
                </Container>
            </>
        );
    }
    return null;
};

Benchmarks.propTypes = {
    id: PropTypes.string.isRequired
};

export default Benchmarks;
