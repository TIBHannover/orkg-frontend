'use client';

import { useComparisonState } from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonContextProvider/ComparisonContextProvider';
import AppliedFilters from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/AppliedFilters/AppliedFilters';
import ComparisonCarousel from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonCarousel/ComparisonCarousel';
import ComparisonHeader from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonHeader/ComparisonHeader';
import useFullWidth from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonHeader/hooks/useFullWidth';
import ComparisonMetaData from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonMetaData/ComparisonMetaData';
import NewComparisonsAlert from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/NewComparisonsAlert/NewComparisonsAlert';
import References from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/References/References';
import NotFound from '@/app/not-found';
import ComparisonLoading from '@/components/Comparison/ComparisonLoading/ComparisonLoading';
import ComparisonTable from '@/components/Comparison/ComparisonTable/ComparisonTable';
import useComparison from '@/components/Comparison/hooks/useComparison';
import EditModeHeader from '@/components/EditModeHeader/EditModeHeader';
import Alert from '@/components/Ui/Alert/Alert';
import Container from '@/components/Ui/Structure/Container';

const ComparisonPage = () => {
    const { id: comparisonId } = useComparisonState();
    const { comparison, error, isLoadingComparisonContents, isEditMode } = useComparison();

    const sourceAmount = comparison?.sources.length ?? 0;
    const { isFullWidth } = useFullWidth({ sourceAmount });
    const containerStyle = isFullWidth ? { maxWidth: 'calc(100% - clamp(20px, 3vw, 100px))' } : {};

    if (error) {
        return <NotFound />;
    }

    if (!comparison) {
        return null;
    }

    return (
        <div>
            {comparison && (
                <>
                    <ComparisonHeader />

                    <div style={{ marginBottom: isEditMode ? 10 : 0 }}>
                        <EditModeHeader isVisible={isEditMode} message="Edit mode" />
                    </div>

                    <Container className="mb-6">
                        <div id="description" className="box flow-root relative md:px-8">
                            <ComparisonMetaData comparisonId={comparison.id} />

                            <AppliedFilters />
                        </div>
                    </Container>
                </>
            )}
            {!isLoadingComparisonContents && sourceAmount > 1 && <ComparisonCarousel />}
            <NewComparisonsAlert />
            <Container className="transition-[max-width] duration-500" style={containerStyle}>
                <div className="box p-0 relative">
                    {!isLoadingComparisonContents && sourceAmount > 0 && <ComparisonTable id={comparisonId} />}

                    {!isLoadingComparisonContents && comparison && sourceAmount <= 1 && (
                        <Alert color="info" className="border-0" fade={false}>
                            <span>
                                {comparison.sources.length === 0
                                    ? "This comparison doesn't have any sources yet"
                                    : 'A comparison needs to have at least 2 sources'}
                                {isEditMode ? (
                                    <>
                                        , click <strong>Add source</strong> in the toolbar above to add sources
                                    </>
                                ) : (
                                    ''
                                )}
                            </span>
                        </Alert>
                    )}
                    {isLoadingComparisonContents && <ComparisonLoading />}
                </div>
            </Container>
            <Container className="mt-6">
                <div className="box md:px-12 flow-root relative">
                    <References />
                </div>
            </Container>
        </div>
    );
};

export default ComparisonPage;
