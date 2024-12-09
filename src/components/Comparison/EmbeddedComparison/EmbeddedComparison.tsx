import Comparison from 'components/Comparison/Comparison';
import ComparisonLoadingComponent from 'components/Comparison/ComparisonLoadingComponent';
import useComparisonOld from 'components/Comparison/hooks/useComparisonOld';
import useComparison from 'components/Comparison/hooks/useComparison';
import { FC, useEffect } from 'react';

type EmbeddedComparisonProps = {
    id: string;
    updateReferences: (contributions: unknown) => void;
    setComparisonDataCallBack: ({ data, properties, metaData }: { data: unknown; properties: unknown; metaData: unknown }) => void;
};

const EmbeddedComparison: FC<EmbeddedComparisonProps> = ({ id, updateReferences, setComparisonDataCallBack }) => {
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
            setComparisonDataCallBack({ data, properties, metaData: comparison });
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
