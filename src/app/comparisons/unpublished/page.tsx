import ComparisonPage from '@/app/comparisons/[comparisonId]/page';

export default function UnpublishedComparisonPage() {
    return <ComparisonPage params={Promise.resolve({ comparisonId: undefined })} />;
}
