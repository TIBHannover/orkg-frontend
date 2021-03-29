import { useEffect } from 'react';
import { useLocation, useHistory } from 'react-router';
import { Container, Row, Col } from 'reactstrap';
import ResearchFieldCards from 'components/Home/ResearchFieldCards';
import ObservatoriesBox from 'components/Home/ObservatoriesBox';
import FeaturedItemsBox from 'components/Home/FeaturedItemsBox';
import LastUpdatesBox from 'components/LastUpdatesBox/LastUpdatesBox';
import Benefits from 'components/Home/Benefits';
import ContributorsBox from 'components/TopContributors/ContributorsBox';
import useResearchFieldSelector from 'components/Home/hooks/useResearchFieldSelector';
import { MISC } from 'constants/graphSettings';
import { toast } from 'react-toastify';

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
