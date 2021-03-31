import { Container } from 'reactstrap';
import useResearchProblemBenchmarks from 'components/ResearchProblem/hooks/useResearchProblemBenchmarks';
import BenchmarksCarousel from 'components/BenchmarksCarousel/BenchmarksCarousel';
import PropTypes from 'prop-types';
import Papers from 'components/ResearchProblem/Papers';
import ResearchProblemHeader from 'components/ResearchProblem/ResearchProblemHeader';
function ResearchProblem(props) {
    const { researchProblemId } = props.match.params;
    const [researchProblemBenchmarksData, isLoadingData] = useResearchProblemBenchmarks();
    return (
        <div>
            <ResearchProblemHeader id={researchProblemId} />
            <Container>
                <h1 className="h4 mt-4 mb-4 flex-grow-1">Benchmarks</h1>
            </Container>
            <Container>
                <BenchmarksCarousel research_problem_benchmarks={researchProblemBenchmarksData} show={6} />
            </Container>
            {/*
                    <Container>
                        <Row>
                            {researchProblemBenchmarksData.length > 0 &&
                                researchProblemBenchmarksData.map(researchProblemBenchmarksData => {
                                    return (
                                        researchProblemBenchmarksData && (
                                            //old section card which causes extra research problems to spill into the next line                         
                                            <BenchmarkSectionCard
                                                //this researchProblemBenchmarksData.id is actually the research problem id of the page
                                                key={`pc${researchProblemId}`}
                                                research_problem_benchmark={researchProblemBenchmarksData}
                                            />
                                        )
                                    );
                                })}
                        </Row>
                    </Container>
                    */}
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
