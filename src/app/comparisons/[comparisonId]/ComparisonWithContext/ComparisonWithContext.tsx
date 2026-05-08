'use client';

import { SWRConfig } from 'swr';

import ComparisonContextProvider from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonContextProvider/ComparisonContextProvider';
import ComparisonPage from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonPage';

type ComparisonWithContextProps = {
    id: string;
    isEmbedded: boolean;
    fallback?: Record<string, unknown>;
};

const ComparisonWithContext = ({ id, isEmbedded, fallback }: ComparisonWithContextProps) => {
    const tree = (
        <ComparisonContextProvider id={id} isEmbedded={isEmbedded}>
            <ComparisonPage />
        </ComparisonContextProvider>
    );
    if (!fallback) {
        return tree;
    }
    return <SWRConfig value={{ fallback }}>{tree}</SWRConfig>;
};

export default ComparisonWithContext;
