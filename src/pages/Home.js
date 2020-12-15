import React, { useEffect } from 'react';
import { useLocation, useHistory } from 'react-router';
import { Container, Row, Col } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faStream } from '@fortawesome/free-solid-svg-icons';
import ResearchFieldCards from 'components/Home/ResearchFieldCards';
import ObservatoriesCarousel from 'components/Home/ObservatoriesCarousel/ObservatoriesCarousel';
import FeaturedItemsBox from 'components/Home/FeaturedItemsBox';
import Jumbotron from 'components/Home/Jumbotron';
import { toast } from 'react-toastify';
import TrendingProblems from 'components/Home/TrendingProblems';

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
        <div>
            <Jumbotron />

            <Container style={{ marginTop: -50 }}>
                <Row>
                    <Col md={7} sm={12} style={{ display: 'flex', flexDirection: 'column' }}>
                        <div className="box rounded-lg p-3">
                            <h2 className="h5">
                                <Icon icon={faStream} className="text-primary" /> Browse by research field
                            </h2>
                            <ResearchFieldCards />
                        </div>
                        <TrendingProblems style={{ flexDirection: 'column', display: 'flex', flexGrow: '1' }} />
                    </Col>
                    <Col md={5} sm={12} style={{ display: 'flex', flexDirection: 'column' }}>
                        <ObservatoriesCarousel />
                        <FeaturedItemsBox />
                    </Col>
                </Row>
            </Container>
        </div>
    );
}
