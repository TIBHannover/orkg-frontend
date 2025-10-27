'use client';

import Benchmarks from '@/components/ResearchProblem/Benchmarks/Benchmarks';
import ResearchProblemHeader from '@/components/ResearchProblem/ResearchProblemHeader';
import ResearchProblemTabsContainer from '@/components/ResearchProblem/ResearchProblemTabsContainer';
import Container from '@/components/Ui/Structure/Container';
import useParams from '@/components/useParams/useParams';

function ResearchProblem() {
    const { researchProblemId, slug } = useParams();

    return (
        <div>
            <ResearchProblemHeader id={researchProblemId} />
            <Benchmarks id={researchProblemId} />
            <Container className="p-0 mt-2">
                <ResearchProblemTabsContainer id={researchProblemId} />
            </Container>
        </div>
    );
}

export default ResearchProblem;
