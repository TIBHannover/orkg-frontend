import { useEffect } from 'react';
import { useLocation, useHistory } from 'react-router';
import { Container, Row, Col, Alert } from 'reactstrap';
import ResearchFieldCards from 'components/Home/ResearchFieldCards';
import ObservatoriesBox from 'components/Home/ObservatoriesBox';
import FeaturedItemsBox from 'components/Home/FeaturedItemsBox';
import LastUpdatesBox from 'components/LastUpdatesBox/LastUpdatesBox';
import Benefits from 'components/Home/Benefits';
import ContributorsBox from 'components/TopContributors/ContributorsBox';
import useResearchFieldSelector from 'components/Home/hooks/useResearchFieldSelector';
import { MISC } from 'constants/graphSettings';
import { toast } from 'react-toastify';
import moment from 'moment';
import { Link } from 'react-router-dom';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import ROUTES_CMS from 'constants/routesCms';

export default function Home() {
    const location = useLocation();
    const history = useHistory();
    const { selectedResearchField, handleFieldSelect, researchFields, isLoadingFields } = useResearchFieldSelector({
        id: MISC.RESEARCH_FIELD_MAIN,
        label: 'Main'
    });

    useEffect(() => {
        document.title = 'Open Research Knowledge Graph';
    }, []);

    const showSignOutMessage = location.state && location.state.signedOut;

    if (showSignOutMessage) {
        const locationState = { ...location.state, signedOut: false };
        history.replace({ state: locationState });
        toast.success('You have been signed out successfully');
    }

    return (
        <Container style={{ marginTop: -70 }}>
            <Alert color="info" className="box mt-2">
                The ORKG <strong>Curation Grant Competition</strong> has launched. Apply until 31st of May 2021.{' '}
                <Link to={reverse(ROUTES.PAGE, { url: ROUTES_CMS.CURATION_CALL })}>Find out more</Link>
            </Alert>

            {moment() < moment('2021-06-13T00:00:00') && (
                <Alert color="info" className="box mt-2">
                    <strong>Webinar:</strong> Open Research Knowledge Graph. <Link to={ROUTES.WEBINAR_MAY_11}>Watch the recording</Link>
                </Alert>
            )}
            <Row>
                <Col md="12">
                    <div className="box rounded-lg p-3">
                        <ResearchFieldCards
                            selectedResearchField={selectedResearchField}
                            handleFieldSelect={handleFieldSelect}
                            researchFields={researchFields}
                            isLoading={isLoadingFields}
                        />
                    </div>
                </Col>
            </Row>
            {selectedResearchField.id !== MISC.RESEARCH_FIELD_MAIN && <div className="h4 mt-4 mb-2 pl-3">{selectedResearchField.label}</div>}
            <Row>
                <Col md="8">
                    <div className="mt-3 mt-md-0 d-flex flex-column">
                        <FeaturedItemsBox researchFieldId={selectedResearchField.id} />
                    </div>
                </Col>
                <Col md="4">
                    <div className="mt-3 box rounded d-flex flex-column overflow-hidden">
                        <Benefits />
                    </div>

                    <div className="mt-3 d-flex flex-column">
                        <ObservatoriesBox researchFieldId={selectedResearchField.id} />
                    </div>

                    <div className="mt-3 d-flex flex-column">
                        <ContributorsBox researchFieldId={selectedResearchField.id} />
                    </div>

                    <div className="mt-3 d-flex flex-column">
                        <LastUpdatesBox researchFieldId={selectedResearchField.id} />
                    </div>
                </Col>
            </Row>
        </Container>
    );
}
