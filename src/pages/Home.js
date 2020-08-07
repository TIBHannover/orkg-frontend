import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faStream } from '@fortawesome/free-solid-svg-icons';
import ResearchFieldCards from '../components/Home/ResearchFieldCards';
import Sidebar from '../components/Home/Sidebar';
import FeaturedComparisons from '../components/Home/FeaturedComparisons';
import Jumbotron from '../components/Home/Jumbotron';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

class Home extends Component {
    componentDidMount = () => {
        document.title = 'Open Research Knowledge Graph';
    };

    componentDidUpdate() {
        const showSignOutMessage = this.props.location.state && this.props.location.state.signedOut;

        if (showSignOutMessage) {
            const locationState = { ...this.props.location.state, signedOut: false };
            this.props.history.replace({ state: locationState });
            toast.success('You have been signed out successfully');
        }
    }

    render = () => {
        return (
            <div>
                <Jumbotron />

                <Container style={{ marginTop: -50 }}>
                    <Row>
                        <Col md={7} sm={12} style={{ display: 'flex', flexDirection: 'column' }}>
                            <FeaturedComparisons />
                            <div className="box rounded-lg mt-4 p-3" style={{ flexDirection: 'column', display: 'flex', flexGrow: '1' }}>
                                <h2 className="h5">
                                    <Icon icon={faStream} className="text-primary" /> Browse by research field
                                </h2>
                                <ResearchFieldCards />
                            </div>
                        </Col>
                        <Col md={5} sm={12} style={{ display: 'flex', flexDirection: 'column' }}>
                            <Sidebar />
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    };
}

Home.propTypes = {
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
};

export default Home;
