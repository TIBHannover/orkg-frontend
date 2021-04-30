import { Container } from 'reactstrap';
import useResearchProblemBenchmarks from 'components/ResearchProblem/hooks/useResearchProblemBenchmarks';
import BenchmarksCarousel from 'components/BenchmarksCarousel/BenchmarksCarousel';
import PropTypes from 'prop-types';
import Papers from 'components/ResearchProblem/Papers';
import ResearchProblemHeader from 'components/ResearchProblem/ResearchProblemHeader';
function ResearchProblem(props) {
    const { researchProblemId } = props.match.params;
    const { researchProblemBenchmarksData } = useResearchProblemBenchmarks({ researchProblemId });
    return (
        <div>
            <ResearchProblemHeader id={researchProblemId} />
            <Container>
                <h1 className="h4 mt-4 mb-4 flex-grow-1">Benchmarks</h1>
            </Container>
            <Container className="p-0">
                <BenchmarksCarousel research_problem_benchmarks={researchProblemBenchmarksData} />
            </Container>
            <Papers id={researchProblemId} boxShadow />
        </div>
    );
}

ResearchProblem.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            researchProblemId: PropTypes.string
        }).isRequired
    }).isRequired
};

export default ResearchProblem;
