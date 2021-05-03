import PropTypes from 'prop-types';
import Papers from 'components/ResearchProblem/Papers';
import Benchmarks from 'components/ResearchProblem/Benchmarks/Benchmarks';
import ResearchProblemHeader from 'components/ResearchProblem/ResearchProblemHeader';
function ResearchProblem(props) {
    const { researchProblemId } = props.match.params;

    return (
        <div>
            <ResearchProblemHeader id={researchProblemId} />
            <Benchmarks id={researchProblemId} />

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
