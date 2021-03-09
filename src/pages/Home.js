import { useEffect } from 'react';
import { useLocation, useHistory } from 'react-router';
import { Container, Row, Col } from 'reactstrap';
import ResearchFieldCards from 'components/Home/ResearchFieldCards';
import ObservatoriesBox from 'components/Home/ObservatoriesBox';
import FeaturedItemsBox from 'components/Home/FeaturedItemsBox';
import LastUpdatesBox from 'components/Home/LastUpdatesBox';
import Benefits from 'components/Home/Benefits';
import ContributorsBox from 'components/Home/ContributorsBox';
import useResearchFieldSelector from 'components/Home/hooks/useResearchFieldSelector';
import Breadcrumbs from 'components/Breadcrumbs/Breadcrumbs';
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
            <div className="mt-3 ">
                {MISC.RESEARCH_FIELD_MAIN !== selectedResearchField.id && (
                    <Breadcrumbs researchFieldId={selectedResearchField.id} onFieldClick={handleFieldSelect} disableLastField />
                )}
            </div>
            <Row>
                <Col md="8">
                    <div className="mt-3 mt-md-0" style={{ display: 'flex', flexDirection: 'column' }}>
                        <FeaturedItemsBox />
                    </div>
                </Col>
                <Col md="4">
                    <div className="mt-3 box rounded" style={{ display: 'flex', flexDirection: 'column' }}>
                        <Benefits />
                    </div>

                    <div className="mt-3" style={{ display: 'flex', flexDirection: 'column' }}>
                        <ObservatoriesBox />
                    </div>

                    <div className="mt-3" style={{ display: 'flex', flexDirection: 'column' }}>
                        <ContributorsBox id={selectedResearchField.id} />
                    </div>

                    <div className="mt-3" style={{ display: 'flex', flexDirection: 'column' }}>
                        <LastUpdatesBox id={selectedResearchField.id} />
                    </div>
                </Col>
            </Row>
        </Container>
    );
}
