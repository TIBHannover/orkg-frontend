import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faStar, faPlus } from '@fortawesome/free-solid-svg-icons';
import ResearchFieldCards from './ResearchFieldCards';
import RecentlyAddedPapers from './RecentlyAddedPapers';
import HomeBannerBg from 'assets/img/home_banner_bg.jpg';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

const StyledAbout = styled.div`
    .aboutContent{
        background: #fff url(${HomeBannerBg}) no-repeat right center;
    }

    @media (max-width: 991px){
        .aboutContent{
            background: #fff;
            flex-direction: column;
        }
    }
`
class Home extends Component {

  componentDidMount = () => {
    document.title = 'Open Research Knowledge Graph'
  }

  componentDidUpdate() {
    const showSignOutMessage = this.props.location.state && this.props.location.state.signedOut;

    if (showSignOutMessage) {
      let locationState = { ...this.props.location.state, signedOut: false }
      this.props.history.replace({ state: locationState });
      toast.success('You have been signed out successfully');
    }
  }

  render = () => {
    return (
      <div>
        <StyledAbout>
          <Container className="box pt-4 pb-4 pl-4 pr-4 aboutContent d-flex mt-5">
            <div className="flex-grow-1">
              <h1 style={{ fontSize: '2rem' }}>Open Research Knowledge Graph</h1>
              <div className="mt-4" style={{ maxWidth: 800 }}>
                <p className="mb-0">The ORKG aims to describe research papers and contributions in a structured manner. With the ORKG research contributions become findable and comparable. Click the button on the right to learn more.</p>
              </div>
            </div>
            <div className="about-link flex-shrink-0 justify-content-center d-flex align-items-center">
              <a href="https://projects.tib.eu/orkg/" target="_blank" rel="noopener noreferrer" className="btn btn-darkblue btn-lg btn-block btn-default" style={{ width: 200 }}>Learn More</a>
            </div>
          </Container>
        </StyledAbout>

        <Container className="mt-4">
          <Row>
            <Col className="col-sm-7 px-0">
              <div className="box mr-4 p-4 h-100">
                <h2 className="h5"><Icon icon={faStar} className="text-primary" /> Browse by research field</h2>
                <ResearchFieldCards />
              </div>
            </Col>
            <Col className="col-sm-5 px-0">
              <div className="box p-4 h-100">
                <h2 className="h5"><Icon icon={faPlus} className="text-primary" /> Recently added papers</h2>
                <RecentlyAddedPapers />
              </div>
            </Col>
          </Row>
        </Container>
      </div >
    );
  }
}

Home.propTypes = {
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
}

export default Home;
