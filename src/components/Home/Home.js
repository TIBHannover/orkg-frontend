import React, { Component } from 'react';
import {
  Container, Row, Col, Alert,
} from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import {
  faInfoCircle, faStar, faPlus, faExternalLinkAlt,
} from '@fortawesome/free-solid-svg-icons';
import ResearchFieldCards from './ResearchFieldCards';
import RecentlyAddedPapers from './RecentlyAddedPapers';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

class Home extends Component {

  componentDidMount = () => {
    document.title = 'Open Research Knowledge Graph'
  }

  checkSignOutMessage = () => {
    const showSignOutMessage = this.props.location.state && this.props.location.state.signedOut;

    if (showSignOutMessage) {
      let locationState = {...this.props.location.state, signedOut: false}
      this.props.history.replace({ state: locationState });
      toast.success('You have been signed out successfully');
    }
  }

  render = () => {
    const showWarning = process.env.REACT_APP_SERVER_URL.includes('labs.tib.eu');
    
    this.checkSignOutMessage();

    return (
      <div>
        <Container className="p-0">
          <h1 className="h4 mt-4 mb-4">Homepage</h1>
        </Container>
        <Container className="box pt-4 pb-4 pl-5 pr-5">
          {showWarning &&
            <Alert color="info">
              <strong>Warning: </strong> The ORKG is currently in an alpha stage. Data you enter in the system can be deleted without any notice.
            </Alert>
          }
          
          <Icon icon={faInfoCircle} className="text-primary" /> The <strong>Open Research Knowledge Graph</strong> - or - ORKG aims to describe research papers and contributions in a structured manner. With ORKG research contributions become findable and comparable. In order to add your own research, or to contribute,
                {' '}<a href="https://projects.tib.eu/orkg/" target="_blank" rel="noopener noreferrer">learn more <Icon icon={faExternalLinkAlt} /></a>
        </Container>

        <Container className="mt-4">
          <Row>
            <Col className="col-sm-7 px-0">
              <div className="box mr-4 p-4 h-100">
                <h2 className="h5">
                  <Icon icon={faStar} className="text-primary" /> Browse by research field
                </h2>
                <ResearchFieldCards />
              </div>
            </Col>
            <Col className="col-sm-5 px-0">
              <div className="box p-4 h-100">
                <h2 className="h5">
                  <Icon icon={faPlus} className="text-primary" /> Recently added papers
                </h2>
                <RecentlyAddedPapers />
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  };
}

Home.propTypes = {
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
}

export default Home;
