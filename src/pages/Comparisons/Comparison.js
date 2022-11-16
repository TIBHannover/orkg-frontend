import { useState, useEffect } from 'react';
import { Alert } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faLightbulb } from '@fortawesome/free-solid-svg-icons';
import ComparisonLoadingComponent from 'components/Comparison/ComparisonLoadingComponent';
import ComparisonTable from 'components/Comparison/Comparison';
import ProvenanceBox from 'components/Comparison/ComparisonFooter/ProvenanceBox/ProvenanceBox';
import RelatedResources from 'components/Comparison/ComparisonFooter/RelatedResources/RelatedResources';
import RelatedFigures from 'components/Comparison/ComparisonFooter/RelatedResources/RelatedFigures';
import ComparisonMetaData from 'components/Comparison/ComparisonHeader/ComparisonMetaData';
import DataSources from 'components/Comparison/ComparisonFooter/DataSources';
import { ContainerAnimated } from 'components/Comparison/styled';
import useComparison from 'components/Comparison/hooks/useComparison';
import PreviewVisualizationComparison from 'libs/selfVisModel/ComparisonComponents/PreviewVisualizationComparison';
import ComparisonHeaderMenu from 'components/Comparison/ComparisonHeader/ComparisonHeaderMenu';
import AppliedFilters from 'components/Comparison/ComparisonHeader/AppliedFilters';
import Outline from 'components/Comparison/Outline';
import { useParams } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import env from '@beam-australia/react-env';
import { useSelector } from 'react-redux';
import useScroll from 'components/Review/hooks/useScroll';

const Comparison = () => {
    const { comparisonId } = useParams();
    useScroll();
    const { comparisonResource, navigateToNewURL } = useComparison({ id: comparisonId });

    const isFailedLoadingMetadata = useSelector(state => state.comparison.isFailedLoadingMetadata);
    const isLoadingResult = useSelector(state => state.comparison.isLoadingResult);
    const isFailedLoadingResult = useSelector(state => state.comparison.isFailedLoadingResult);

    const contributionsList = useSelector(state => state.comparison.configuration.contributionsList);
    const fullWidth = useSelector(state => state.comparison.configuration.fullWidth);

    /** adding some additional state for meta data * */

    const [cookies, setCookie] = useCookies();

    const [hideScrollHint, setHideScrollHint] = useState(cookies.seenShiftMouseWheelScroll ? cookies.seenShiftMouseWheelScroll : false);

    const onDismissShiftMouseWheelScroll = () => {
        // dismiss function for the alert thingy!;
        setCookie('seenShiftMouseWheelScroll', true, { path: env('PUBLIC_URL'), maxAge: 315360000 }); // << TEN YEARS
        setHideScrollHint(true);
    };

    const containerStyle = fullWidth ? { maxWidth: 'calc(100% - 100px)' } : {};

    useEffect(() => {
        if (comparisonResource?.label) {
            document.title = `${comparisonResource.label} - Comparison - ORKG`;
        }
    }, [comparisonResource]);

    return (
        <div>
            <ComparisonHeaderMenu navigateToNewURL={navigateToNewURL} />

            <ContainerAnimated id="description" className="box rounded pt-4 pb-4 ps-5 pe-5 clearfix position-relative" style={containerStyle}>
                {comparisonResource.id && <Outline />}
                <ComparisonMetaData />

                {!isFailedLoadingMetadata && !isFailedLoadingResult && (
                    <>
                        {contributionsList.length > 3 && (
                            <Alert className="mt-3" color="info" isOpen={!hideScrollHint} toggle={onDismissShiftMouseWheelScroll}>
                                <Icon icon={faLightbulb} /> Use{' '}
                                <b>
                                    <i>Shift</i>
                                </b>{' '}
                                +{' '}
                                <b>
                                    <i>Mouse Wheel</i>
                                </b>{' '}
                                for horizontal scrolling in the table.
                            </Alert>
                        )}
                        <AppliedFilters />

                        {!isLoadingResult && contributionsList.length > 1 && (
                            <div className="mt-1">
                                <PreviewVisualizationComparison />

                                <ComparisonTable object={comparisonResource} />
                            </div>
                        )}

                        {!isLoadingResult && contributionsList.length <= 1 && (
                            <Alert className="mt-3 text-center" color="danger">
                                Sorry, this comparison doesn't have the minimum amount of research contributions to compare on
                            </Alert>
                        )}

                        {isLoadingResult && <ComparisonLoadingComponent />}
                    </>
                )}

                <RelatedResources />
                <RelatedFigures />
                <DataSources />
            </ContainerAnimated>

            {comparisonResource.id && <ProvenanceBox />}
        </div>
    );
};

export default Comparison;
