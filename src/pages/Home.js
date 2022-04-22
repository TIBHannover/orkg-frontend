import { useNavigate, useLocation } from 'react-router-dom-v5-compat';
import { Container, Row, Col } from 'reactstrap';
import ResearchFieldCards from 'components/Home/ResearchFieldCards';
import ObservatoriesBox from 'components/Home/ObservatoriesBox';
import FeaturedItemsBox from 'components/Home/FeaturedItemsBox';
import LastUpdatesBox from 'components/LastUpdatesBox/LastUpdatesBox';
import Benefits from 'components/Home/Benefits';
import News from 'components/Home/News';
import ContributorsBox from 'components/TopContributors/ContributorsBox';
import useResearchFieldSelector from 'components/Home/hooks/useResearchFieldSelector';
import { MISC } from 'constants/graphSettings';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet';
import env from '@beam-australia/react-env';
import HomeAlerts from 'components/HomeAlerts/HomeAlerts';
import { useEffect } from 'react';

export default function Home() {
    const location = useLocation();
    const navigate = useNavigate();
    const { selectedResearchField, handleFieldSelect, researchFields, isLoadingFields } = useResearchFieldSelector({
        id: MISC.RESEARCH_FIELD_MAIN,
        label: 'Main'
    });

    useEffect(() => {
        const showSignOutMessage = location.state && location.state.signedOut;

        if (showSignOutMessage) {
            const locationState = { ...location.state, signedOut: false };
            navigate({ state: locationState, replace: true });
            toast.success('You have been signed out successfully');
        }
    }, [location, navigate]);

    return (
        <Container style={{ marginTop: env('IS_TESTING_SERVER') === 'true' ? -20 : -70 }}>
            <Helmet>
                <title>Open Research Knowledge Graph</title>
                <meta property="og:title" content="Open Research Knowledge Graph" />
                <meta property="og:type" content="website" />
                <meta
                    property="og:description"
                    content="The Open Research Knowledge Graph (ORKG) aims to describe research papers in a structured manner. With the ORKG, papers are easier to find and compare."
                />
            </Helmet>
            <HomeAlerts />
            <Row style={{ position: 'relative', zIndex: 99 }}>
                <Col md="12">
                    <div className="box rounded-3 p-3">
                        <ResearchFieldCards
                            selectedResearchField={selectedResearchField}
                            handleFieldSelect={handleFieldSelect}
                            researchFields={researchFields}
                            isLoading={isLoadingFields}
                        />
                    </div>
                </Col>
            </Row>
            {selectedResearchField.id !== MISC.RESEARCH_FIELD_MAIN && <div className="h4 mt-4 mb-2 ps-3">{selectedResearchField.label}</div>}
            <Row>
                <Col md="8">
                    <div className="mt-3 mt-md-0 d-flex flex-column">
                        <FeaturedItemsBox researchFieldId={selectedResearchField.id} researchFieldLabel={selectedResearchField.label} />
                    </div>
                </Col>
                <Col md="4">
                    <div className="mt-3 box rounded d-flex flex-column overflow-hidden">
                        <News />
                    </div>

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
