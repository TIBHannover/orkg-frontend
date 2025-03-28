'use client';

import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useCookies } from 'react-cookie';
import { useSelector } from 'react-redux';
import { Alert, Button, Container } from 'reactstrap';

import NotFound from '@/app/not-found';
import AddContribution from '@/components/Comparison/AddContribution/AddContribution';
import ComparisonTable from '@/components/Comparison/Comparison';
import ComparisonCarousel from '@/components/Comparison/ComparisonCarousel/ComparisonCarousel';
import AppliedFilters from '@/components/Comparison/ComparisonHeader/AppliedFilters';
import ComparisonHeaderMenu from '@/components/Comparison/ComparisonHeader/ComparisonHeaderMenu';
import ComparisonMetaData from '@/components/Comparison/ComparisonHeader/ComparisonMetaData';
import LiveComparisonHeader from '@/components/Comparison/ComparisonHeader/LiveComparisonHeader';
import ComparisonLoadingComponent from '@/components/Comparison/ComparisonLoadingComponent';
import useComparison from '@/components/Comparison/hooks/useComparison';
import useComparisonOld from '@/components/Comparison/hooks/useComparisonOld';
import References from '@/components/Comparison/References/References';
import { ContainerAnimated } from '@/components/Comparison/styled';
import EditModeHeader from '@/components/EditModeHeader/EditModeHeader';
import useParams from '@/components/useParams/useParams';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';

const Comparison = () => {
    const [isOpenAddContributionModal, setIsOpenAddContributionModal] = useState(false);

    const { comparisonId } = useParams<{ comparisonId: string }>();
    const searchParams = useSearchParams();
    const { comparison, isPublished, updateComparison, error } = useComparison(comparisonId);
    const { isEditMode } = useIsEditMode();
    const [cookies] = useCookies(['useFullWidthForComparisonTable']);
    // @ts-expect-error awaiting migration
    const hasFailedLoadingComparisonTable = useSelector((state) => state.comparison.isFailedLoadingResult);

    const isLiveComparison = !comparisonId;
    let contributionsLiveComparison = searchParams.getAll('contributions');
    if (contributionsLiveComparison?.length === 1 && contributionsLiveComparison[0].includes(',')) {
        contributionsLiveComparison = searchParams.get('contributions')?.split(',') ?? [];
    }
    // ensure the comparison data is available in the redux store
    const { isLoadingResult: isLoadingComparisonTable } = useComparisonOld({
        id: comparisonId,
        isPublished,
        contributionIds: !isLiveComparison ? comparison?.config?.contributions : contributionsLiveComparison,
    });

    const contributionsList = !isLiveComparison ? comparison?.contributions ?? [] : contributionsLiveComparison;
    const fullWidth = cookies.useFullWidthForComparisonTable ?? contributionsList.length > 3;
    const containerStyle = fullWidth ? { maxWidth: 'calc(100% - 100px)' } : {};

    const handleAddContributions = (newContributionIds: string[]) => {
        if (!comparison) {
            return;
        }
        updateComparison({
            contributions: [...comparison.contributions, ...newContributionIds.map((id) => ({ id, label: '' }))],
            config: {
                ...comparison.config,
                contributions: [...comparison.config.contributions, ...newContributionIds],
            },
        });
    };

    if (error) {
        return <NotFound />;
    }

    if (!comparison && !isLiveComparison) {
        return null;
    }

    return (
        <div>
            {!isLiveComparison && comparison && (
                <>
                    <ComparisonHeaderMenu />

                    <Container className="box rounded p-0 clearfix position-relative overflow-hidden" style={{ marginBottom: isEditMode ? 10 : 0 }}>
                        <EditModeHeader isVisible={isEditMode} message="Edit mode" />
                    </Container>

                    <Container id="description" className="box rounded clearfix position-relative mb-4 px-5">
                        <ComparisonMetaData comparisonId={comparison.id} />

                        <AppliedFilters />
                    </Container>
                </>
            )}
            {isLiveComparison && <LiveComparisonHeader contributionIds={contributionsList as string[]} />}

            {!isLoadingComparisonTable && contributionsList.length > 1 && <ComparisonCarousel />}

            <ContainerAnimated className="box rounded p-0 clearfix position-relative" style={containerStyle}>
                {!hasFailedLoadingComparisonTable && (
                    <>
                        {!isLoadingComparisonTable && contributionsList.length > 1 && <ComparisonTable />}
                        {!isLoadingComparisonTable && contributionsList.length <= 1 && (
                            <Alert className="mt-3 text-center border-0" color="info" fade={false}>
                                {contributionsList.length === 0
                                    ? "This comparison doesn't have any contributions yet"
                                    : 'A comparison needs to have at least 2 contributions'}
                                {isEditMode ? (
                                    <>
                                        , click on the <strong>plus button on the right</strong> to add contributions.
                                    </>
                                ) : (
                                    '.'
                                )}
                            </Alert>
                        )}
                        {isEditMode && (
                            <Button
                                color="primary"
                                className="shadow"
                                style={{ position: 'absolute', right: -45, paddingLeft: 10, paddingRight: 10, top: 0, zIndex: 10 }}
                                aria-label="add contribution"
                                onClick={() => setIsOpenAddContributionModal(true)}
                            >
                                <FontAwesomeIcon icon={faPlus} />
                            </Button>
                        )}
                        {isLoadingComparisonTable && <ComparisonLoadingComponent />}
                    </>
                )}
            </ContainerAnimated>

            <Container className="box rounded px-5 clearfix position-relative mt-4">
                <References />
            </Container>

            {isOpenAddContributionModal && (
                <AddContribution onAddContributions={handleAddContributions} showDialog toggle={() => setIsOpenAddContributionModal((v) => !v)} />
            )}
        </div>
    );
};

export default Comparison;
