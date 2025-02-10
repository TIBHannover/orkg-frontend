'use client';

import ComparisonPopup from 'components/ComparisonPopup/ComparisonPopup';
import Benchmarks from 'components/ResearchProblem/Benchmarks/Benchmarks';
import ResearchProblemHeader from 'components/ResearchProblem/ResearchProblemHeader';
import ResearchProblemTabsContainer from 'components/ResearchProblem/ResearchProblemTabsContainer';
import useParams from 'components/useParams/useParams';
import { Container } from 'reactstrap';

function ResearchProblem() {
    const { researchProblemId, slug } = useParams();

    return (
        <div>
            <ResearchProblemHeader id={researchProblemId} />
            <Benchmarks id={researchProblemId} />
            <Container className="p-0 mt-2">
                <ResearchProblemTabsContainer id={researchProblemId} />
            </Container>
            <ComparisonPopup />
        </div>
    );
}

export default ResearchProblem;
