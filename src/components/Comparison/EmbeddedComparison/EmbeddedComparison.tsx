import Comparison from 'components/Comparison/Comparison';
import ComparisonLoadingComponent from 'components/Comparison/ComparisonLoadingComponent';
import useComparisonOld from 'components/Comparison/hooks/useComparisonOld';
import useComparison from 'components/Comparison/hooks/useComparison';
import { FC, useEffect } from 'react';

type EmbeddedComparisonProps = {
    id: string;
    updateReferences: (contributions: { paper_id: string }[]) => void;
};

const EmbeddedComparison: FC<EmbeddedComparisonProps> = ({ id, updateReferences }) => {
    const { comparison } = useComparison(id);
    const { isLoadingResult, data, contributions, properties } = useComparisonOld({
        id,
        isEmbeddedMode: true,
        isPublished: true,
        contributionIds: undefined,
    });
    useEffect(() => {
        if (!isLoadingResult) {
            updateReferences(contributions);
        }
    }, [comparison, contributions, data, isLoadingResult, properties]);
    return (
        <>
            {id && !isLoadingResult && contributions.length > 0 && <Comparison />}
            {id && isLoadingResult && <ComparisonLoadingComponent />}
        </>
    );
};

export default EmbeddedComparison;
