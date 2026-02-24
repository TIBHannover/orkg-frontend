import { FC, useEffect } from 'react';

import ComparisonContextProvider from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonContextProvider/ComparisonContextProvider';
import ComparisonLoading from '@/components/Comparison/ComparisonLoading/ComparisonLoading';
import ComparisonTable from '@/components/Comparison/ComparisonTable/ComparisonTable';
import useComparison from '@/components/Comparison/hooks/useComparison';
import { CLASSES } from '@/constants/graphSettings';

type EmbeddedComparisonProps = {
    id: string;
    updateReferences: (paperIds: string[]) => void;
};

const EmbeddedComparison: FC<EmbeddedComparisonProps> = ({ id, updateReferences }) => {
    const { comparisonContents, isLoadingComparisonContents, isLoading } = useComparison(id, true);

    useEffect(() => {
        if (!isLoadingComparisonContents && comparisonContents) {
            updateReferences(comparisonContents.titles.filter((title) => title.classes.includes(CLASSES.PAPER)).map((title) => title.id));
        }
    }, [comparisonContents, isLoadingComparisonContents, updateReferences]);

    const isLoadingResult = isLoading || isLoadingComparisonContents;

    return (
        <ComparisonContextProvider id={id} isEmbedded>
            {id && !isLoadingResult && comparisonContents && comparisonContents?.titles.length > 0 && <ComparisonTable id={id} />}
            {id && isLoadingResult && <ComparisonLoading />}
        </ComparisonContextProvider>
    );
};

export default EmbeddedComparison;
