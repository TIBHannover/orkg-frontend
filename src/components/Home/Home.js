import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faStream } from '@fortawesome/free-solid-svg-icons';
import ResearchFieldCards from './ResearchFieldCards';
import Sidebar from './Sidebar';
import FeaturedComparisons from './FeaturedComparisons';
import Jumbotron from './Jumbotron';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

class Home extends Component {
    componentDidMount = () => {
        document.title = 'Open Research Knowledge Graph';
    };

    componentDidUpdate() {
        const showSignOutMessage = this.props.location.state && this.props.location.state.signedOut;

        if (showSignOutMessage) {
            let locationState = { ...this.props.location.state, signedOut: false };
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
                        <Col className="col-sm-7 px-0" style={{ display: 'flex', flexDirection: 'column' }}>
                            <FeaturedComparisons />
                            <div className="box mt-4 mr-4 p-4" style={{ flexDirection: 'column', display: 'flex', flexGrow: '1' }}>
                                <h2 className="h5">
                                    <Icon icon={faStream} className="text-primary" /> Browse by research field
                                </h2>
                                <ResearchFieldCards />
                            </div>
                        </Col>
                        <Col className="col-sm-5 px-0" style={{ display: 'flex', flexDirection: 'column' }}>
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
