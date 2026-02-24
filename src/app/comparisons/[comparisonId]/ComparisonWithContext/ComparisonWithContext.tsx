'use client';

import ComparisonContextProvider from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonContextProvider/ComparisonContextProvider';
import ComparisonPage from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonPage';

const ComparisonWithContext = ({ id, isEmbedded }: { id: string; isEmbedded: boolean }) => {
    return (
        <ComparisonContextProvider id={id} isEmbedded={isEmbedded}>
            <ComparisonPage />
        </ComparisonContextProvider>
    );
};

export default ComparisonWithContext;
