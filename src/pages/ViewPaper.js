import { Container, Alert, UncontrolledAlert } from 'reactstrap';
import NotFound from 'pages/NotFound';
import ContentLoader from 'react-content-loader';
import { useParams, useLocation } from 'react-router-dom';
import Contributions from 'components/ViewPaper/Contributions';
import useViewPaper from 'components/ViewPaper/hooks/useViewPaper';
import ComparisonPopup from 'components/ComparisonPopup/ComparisonPopup';
import PaperHeader from 'components/ViewPaper/PaperHeader';
import Breadcrumbs from 'components/Breadcrumbs/Breadcrumbs';
import GizmoGraphViewModal from 'components/ViewPaper/GraphView/GizmoGraphViewModal';
import ShareLinkMarker from 'components/ShareLinkMarker/ShareLinkMarker';
import VisibilitySensor from 'react-visibility-sensor';
import { useSelector } from 'react-redux';
import queryString from 'query-string';
import PaperHeaderBar from 'components/ViewPaper/PaperHeaderBar/PaperHeaderBar';
import PaperMenuBar from 'components/ViewPaper/PaperHeaderBar/PaperMenuBar';
import styled from 'styled-components';

export const EditModeHeader = styled(Container)`
    background-color: #80869b !important;
    color: #fff;
    padding: 8px 25px !important;
    display: flex;
    align-items: center;
`;

export const Title = styled.div`
    font-size: 1.1rem;
    flex-grow: 1;
    & span {
        font-size: small;
        color: ${props => props.theme.lightDarker};
    }
`;

const ViewPaper = () => {
    const { resourceId, contributionId } = useParams();
    const location = useLocation();
    const viewPaper = useSelector(state => state.viewPaper);
    const paperLink = useSelector(state =>
        state.viewPaper.url
            ? state.viewPaper.url
            : state.viewPaper.doi && state.viewPaper.doi.startsWith('10.')
            ? 'https://doi.org/' + state.viewPaper.doi
            : ''
    );

    const {
        isLoading,
        isLoadingFailed,
        showHeaderBar,
        editMode,
        toggle,
        handleShowHeaderBar,
        isLoadingContributionFailed,
        selectedContribution,
        contributions,
        handleChangeContributionLabel,
        setEditMode,
        handleCreateContribution,
        toggleDeleteContribution,
        observatoryInfo,
        contributors,
        getObservatoryInfo,
        setShowGraphModal,
        showGraphModal
    } = useViewPaper({
        paperId: resourceId,
        contributionId
    });

    let comingFromWizard = queryString.parse(location.search);
    comingFromWizard = comingFromWizard ? comingFromWizard.comingFromWizard === 'true' : false;

    return (
        <div>
            {!isLoading && isLoadingFailed && <NotFound />}
            {!isLoadingFailed && (
                <>
                    {showHeaderBar && (
                        <PaperHeaderBar paperLink={paperLink} editMode={editMode} toggle={toggle} id={resourceId} paperTitle={viewPaper.title} />
                    )}

                    <Breadcrumbs researchFieldId={viewPaper.researchField.id} />

                    <VisibilitySensor onChange={handleShowHeaderBar}>
                        <Container className="d-flex align-items-center">
                            <h1 className="h4 mt-4 mb-4 flex-grow-1">View paper</h1>
                            <PaperMenuBar editMode={editMode} paperLink={paperLink} toggle={toggle} id={resourceId} />
                        </Container>
                    </VisibilitySensor>

                    {editMode && (
                        <EditModeHeader className="box rounded-top">
                            <Title>
                                Edit mode <span className="pl-2">Every change you make is automatically saved</span>
                            </Title>
                        </EditModeHeader>
                    )}
                    <Container
                        className={`box pt-md-4 pb-md-4 pl-md-5 pr-md-5 pt-sm-2 pb-sm-2 pl-sm-2 pr-sm-2 clearfix position-relative 
                                ${editMode ? 'rounded-bottom' : 'rounded'}`}
                    >
                        <ShareLinkMarker typeOfLink="paper" title={viewPaper.title} />

                        {isLoading && (
                            <ContentLoader
                                height="100%"
                                width="100%"
                                viewBox="0 0 100 10"
                                style={{ width: '100% !important' }}
                                speed={2}
                                backgroundColor="#f3f3f3"
                                foregroundColor="#ecebeb"
                            >
                                <rect x="0" y="0" width="80" height="4" />
                                <rect x="0" y="6" rx="1" ry="1" width="10" height="2" />
                                <rect x="12" y="6" rx="1" ry="1" width="10" height="2" />
                                <rect x="24" y="6" rx="1" ry="1" width="10" height="2" />
                                <rect x="36" y="6" rx="1" ry="1" width="10" height="2" />
                            </ContentLoader>
                        )}
                        {!isLoading && !isLoadingFailed && (
                            <>
                                {comingFromWizard && (
                                    <UncontrolledAlert color="info">
                                        Help us to improve the ORKG and{' '}
                                        <a href="https://forms.gle/AgcUXuiuQzexqZmr6" target="_blank" rel="noopener noreferrer">
                                            fill out the online evaluation form
                                        </a>
                                        . Thank you!
                                    </UncontrolledAlert>
                                )}
                                <PaperHeader editMode={editMode} />
                            </>
                        )}
                        {!isLoadingFailed && !isLoadingContributionFailed && (
                            <>
                                <hr className="mt-3" />

                                <Contributions
                                    selectedContribution={selectedContribution}
                                    contributions={contributions}
                                    paperId={resourceId}
                                    paperTitle={viewPaper.title}
                                    enableEdit={editMode}
                                    toggleEditMode={() => setEditMode(v => !v)}
                                    handleChangeContributionLabel={handleChangeContributionLabel}
                                    handleCreateContribution={handleCreateContribution}
                                    toggleDeleteContribution={toggleDeleteContribution}
                                    observatoryInfo={observatoryInfo}
                                    contributors={contributors}
                                    changeObservatory={getObservatoryInfo}
                                />

                                <ComparisonPopup />
                            </>
                        )}
                        {!isLoadingFailed && isLoadingContributionFailed && (
                            <>
                                <hr className="mt-4 mb-5" />
                                <Alert color="danger">Failed to load contributions.</Alert>
                            </>
                        )}
                    </Container>
                </>
            )}

            <GizmoGraphViewModal showDialog={showGraphModal} toggle={() => setShowGraphModal(v => !v)} paperId={resourceId} />
        </div>
    );
};

export default ViewPaper;
