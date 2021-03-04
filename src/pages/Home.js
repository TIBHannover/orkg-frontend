import { useEffect } from 'react';
import { useLocation, useHistory } from 'react-router';
import { Container, Row, Col } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faStream } from '@fortawesome/free-solid-svg-icons';
import ResearchFieldCards from 'components/Home/ResearchFieldCards';
import ObservatoriesBox from 'components/Home/ObservatoriesBox';
import FeaturedItemsBox from 'components/Home/FeaturedItemsBox';
import LastUpdatesBox from 'components/Home/LastUpdatesBox';
import Benefits from 'components/Home/Benefits';
import ContributorsBox from 'components/Home/ContributorsBox';
import Breadcrumbs from 'components/Breadcrumbs/Breadcrumbs';
import { toast } from 'react-toastify';

export default function Home() {
    const location = useLocation();
    const history = useHistory();

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
                        <h2 className="h5">
                            <Icon icon={faStream} className="text-primary" /> Browse by research field
                        </h2>
                        <ResearchFieldCards />
                    </div>
                </Col>
            </Row>
            <div className="mt-3 ">
                <Breadcrumbs researchFieldId="R375" />
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
                        <ContributorsBox id="R12" />
                    </div>

                    <div className="mt-3" style={{ display: 'flex', flexDirection: 'column' }}>
                        <LastUpdatesBox id="R12" />
                    </div>
                </Col>
            </Row>
        </Container>
    );
}
