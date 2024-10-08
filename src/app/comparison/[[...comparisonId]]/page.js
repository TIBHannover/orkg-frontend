'use client';

import ComparisonTable from 'components/Comparison/Comparison';
import PreviewVisualizationComparison from 'components/Comparison/ComparisonCarousel/ComparisonCarousel';
import DataSources from 'components/Comparison/ComparisonFooter/DataSources';
import ProvenanceBox from 'components/Comparison/ComparisonFooter/ProvenanceBox/ProvenanceBox';
import AppliedFilters from 'components/Comparison/ComparisonHeader/AppliedFilters';
import ComparisonHeaderMenu from 'components/Comparison/ComparisonHeader/ComparisonHeaderMenu';
import ComparisonMetaData from 'components/Comparison/ComparisonHeader/ComparisonMetaData';
import ComparisonLoadingComponent from 'components/Comparison/ComparisonLoadingComponent';
import useComparison from 'components/Comparison/hooks/useComparison';
import { ContainerAnimated } from 'components/Comparison/styled';
import EditModeHeader from 'components/EditModeHeader/EditModeHeader';
import useParams from 'components/useParams/useParams';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Container } from 'reactstrap';
import { setConfigurationAttribute } from 'slices/comparisonSlice';

const Comparison = () => {
    const { comparisonId } = useParams();
    const searchParams = useSearchParams();
    const { comparisonResource, navigateToNewURL } = useComparison({ id: comparisonId });
    const isFailedLoadingMetadata = useSelector((state) => state.comparison.isFailedLoadingMetadata);
    const isLoadingResult = useSelector((state) => state.comparison.isLoadingResult);
    const isFailedLoadingResult = useSelector((state) => state.comparison.isFailedLoadingResult);
    const contributionsList = useSelector((state) => state.comparison.configuration.contributionsList);
    const fullWidth = useSelector((state) => state.comparison.configuration.fullWidth);
    const isEditing = useSelector((state) => state.comparison.isEditing);
    const containerStyle = fullWidth ? { maxWidth: 'calc(100% - 100px)' } : {};
    const [cookies] = useCookies(['useFullWidthForComparisonTable']);
    const isPublished = !!comparisonResource?.id || searchParams.get('noResource');

    const dispatch = useDispatch();

    useEffect(() => {
        if (comparisonResource?.label) {
            document.title = `${comparisonResource.label} - Comparison - ORKG`;
        }
        // if the comparison has more than 3 contributions, and the cookie is not set, make the table full width
        if (!cookies.useFullWidthForComparisonTable && !fullWidth && contributionsList.length > 3) {
            dispatch(setConfigurationAttribute({ attribute: 'fullWidth', value: true }));
        }
    }, [comparisonResource, contributionsList.length, cookies, dispatch, fullWidth]);

    return (
        <div>
            <ComparisonHeaderMenu navigateToNewURL={navigateToNewURL} />

            <Container id="description" className="box rounded clearfix position-relative mb-4 px-5">
                <ComparisonMetaData />

                {!isLoadingResult && contributionsList.length > 1 && <PreviewVisualizationComparison />}
                <AppliedFilters />
            </Container>

            <Container className="box rounded p-0 clearfix position-relative overflow-hidden" style={{ marginBottom: isEditing ? 10 : 0 }}>
                <EditModeHeader isVisible={isEditing} message="Edit mode" />
            </Container>

            <ContainerAnimated className="box rounded p-0 clearfix position-relative" style={containerStyle}>
                {!isFailedLoadingMetadata && !isFailedLoadingResult && (
                    <>
                        {!isLoadingResult && contributionsList.length > 1 && <ComparisonTable object={comparisonResource} />}

                        {!isLoadingResult && contributionsList.length <= 1 && (
                            <Alert className="mt-3 text-center" color="danger">
                                Sorry, this comparison doesn't have the minimum amount of research contributions to compare on
                            </Alert>
                        )}

                        {isLoadingResult && <ComparisonLoadingComponent />}
                    </>
                )}
            </ContainerAnimated>

            <Container className="box rounded px-5 clearfix position-relative mt-4">
                <DataSources />
            </Container>
            {isPublished && <ProvenanceBox />}
        </div>
    );
};

export default Comparison;
