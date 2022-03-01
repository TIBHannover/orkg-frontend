import IntegratedList from 'components/ResearchProblem/IntegratedList';
import { useParams } from 'react-router-dom';
import Benchmarks from 'components/ResearchProblem/Benchmarks/Benchmarks';
import ResearchProblemHeader from 'components/ResearchProblem/ResearchProblemHeader';
function ResearchProblem() {
    const { researchProblemId, slug } = useParams();

    return (
        <div>
            <ResearchProblemHeader id={researchProblemId} />
            <Benchmarks id={researchProblemId} />

            <IntegratedList id={researchProblemId} slug={slug} boxShadow />
        </div>
    );
}

export default ResearchProblem;
