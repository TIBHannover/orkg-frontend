'use client';

import IntegratedList from 'components/ResearchProblem/IntegratedList';
import useParams from 'components/NextJsMigration/useParams';
import Benchmarks from 'components/ResearchProblem/Benchmarks/Benchmarks';
import ResearchProblemHeader from 'components/ResearchProblem/ResearchProblemHeader';
import ComparisonPopup from 'components/ComparisonPopup/ComparisonPopup';

function ResearchProblem() {
    const { researchProblemId, slug } = useParams();

    return (
        <div>
            <ResearchProblemHeader id={researchProblemId} />
            <Benchmarks id={researchProblemId} />

            <IntegratedList id={researchProblemId} slug={slug} boxShadow />
            <ComparisonPopup />
        </div>
    );
}

export default ResearchProblem;
