'use client';

import { Alert, Button } from '@heroui/react';
import dynamic from 'next/dynamic';

import { useComparisonState } from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonContextProvider/ComparisonContextProvider';
import AppliedFilters from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/AppliedFilters/AppliedFilters';
import ComparisonHeader from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonHeader/ComparisonHeader';
import useFullWidth from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonHeader/hooks/useFullWidth';
import ComparisonMetaData from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonMetaData/ComparisonMetaData';
import useManagePropertiesModal from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/hooks/useManagePropertiesModal';
import NewComparisonsAlert from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/NewComparisonsAlert/NewComparisonsAlert';
import PropertySelectionInfoAlert from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/PropertySelectionInfoAlert/PropertySelectionInfoAlert';
import References from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/References/References';
import ServerErrorAlert from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ServerErrorAlert/ServerErrorAlert';
import NotFound from '@/app/not-found';
import ComparisonLoading from '@/components/Comparison/ComparisonLoading/ComparisonLoading';
import TablePathsModal from '@/components/Comparison/ComparisonTable/ColumnHeaders/FirstColumnHeader/TablePathsModal/TablePathsModal';
import useComparison from '@/components/Comparison/hooks/useComparison';
import EditModeHeader from '@/components/EditModeHeader/EditModeHeader';
import Container from '@/components/Ui/Structure/Container';

// Both rely on browser-only globals (ResizeObserver / react-slick). Render client-side only — data is
// already hydrated synchronously via SWR fallback, so there is no fetch wait at hydration time.
const ComparisonTable = dynamic(() => import('@/components/Comparison/ComparisonTable/ComparisonTable'), {
    ssr: false,
    loading: () => <ComparisonLoading />,
});
const ComparisonCarousel = dynamic(
    () => import('@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonCarousel/ComparisonCarousel'),
    { ssr: false },
);

const ComparisonPage = () => {
    const { id: comparisonId } = useComparisonState();
    const { openManageProperties, isManagePropertiesOpen } = useManagePropertiesModal();
    const { comparison, comparisonContents, error, errorComparisonContents, isLoadingComparisonContents, isEditMode } = useComparison();
    const sourceAmount = comparison?.sources.length ?? 0;
    const { isFullWidth } = useFullWidth({ sourceAmount });
    const containerStyle = isFullWidth ? { maxWidth: 'calc(100% - clamp(20px, 3vw, 100px))' } : {};

    const showServerError = errorComparisonContents && errorComparisonContents.statusCode >= 500;
    const showManagePropertiesAlert =
        isEditMode && !isLoadingComparisonContents && sourceAmount >= 2 && comparisonContents?.selected_paths?.length === 0;

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
            <PropertySelectionInfoAlert />
            <Container className="transition-[max-width] duration-500" style={containerStyle}>
                {showManagePropertiesAlert && (
                    <Alert status="warning" className="my-2">
                        <Alert.Indicator />
                        <Alert.Content>
                            <Alert.Title>No properties selected</Alert.Title>
                            <Alert.Description>
                                There are no properties selected for this comparison. Add properties to get started.
                            </Alert.Description>
                        </Alert.Content>
                        <Button size="sm" variant="secondary" onPress={openManageProperties}>
                            Manage properties
                        </Button>
                    </Alert>
                )}
                {showServerError ? (
                    <ServerErrorAlert />
                ) : (
                    <div className="box p-0 relative">
                        {!isLoadingComparisonContents && sourceAmount >= 2 && <ComparisonTable id={comparisonId} />}
                        {!isLoadingComparisonContents && sourceAmount <= 1 && (
                            <Alert status="warning" className="border-0">
                                <Alert.Indicator />
                                <Alert.Content>
                                    <Alert.Title>{sourceAmount === 0 ? 'No sources yet' : 'Not enough sources'}</Alert.Title>
                                    <Alert.Description>
                                        {sourceAmount === 0
                                            ? "This comparison doesn't have any sources yet."
                                            : 'A comparison needs to have at least 2 sources.'}
                                        {isEditMode && (
                                            <>
                                                {' '}
                                                Click <strong>Add source</strong> in the toolbar above to add sources.
                                            </>
                                        )}
                                    </Alert.Description>
                                </Alert.Content>
                            </Alert>
                        )}
                        {isLoadingComparisonContents && <ComparisonLoading />}
                    </div>
                )}
            </Container>
            <Container className="mt-6">
                <div className="box md:px-12 flow-root relative">
                    <References />
                </div>
            </Container>
            {isEditMode && isManagePropertiesOpen && <TablePathsModal />}
        </div>
    );
};

export default ComparisonPage;
