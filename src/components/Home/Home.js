import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faStar, faPlus } from '@fortawesome/free-solid-svg-icons';
import ResearchFieldCards from './ResearchFieldCards';
import RecentlyAddedPapers from './RecentlyAddedPapers';
import HomeBannerBg from 'assets/img/home_banner_bg.jpg';
import styled from 'styled-components';

const StyledAbout = styled.div`
    h1{
        color: ${(props) => props.theme.darkblue};
    }
    h1 span{
        color: ${(props) => props.theme.orkgPrimaryColor};
    }
    .aboutContent{
        border-radius: 5px;
        background: #fff url(${HomeBannerBg}) no-repeat right center;
    }
    .aboutContent > .row{
        display:table;
        width: calc(100% + 30px);
    }
    .aboutContent > .row > [class^="col-"],
    .aboutContent > .row > [class*=" col-"]{
        float:none;
        display:table-cell;
        vertical-align:middle;
    }

    @media (max-width: 991px){
        .aboutContent{
            background: #fff;
        }
        .aboutContent > .row{
            display:block;
            width: auto;
        }
        .aboutContent > .row > [class^="col-"],
        .aboutContent > .row > [class*=" col-"]{
            float:none;
            display:block;
            vertical-align:middle;
            position: relative;
        }
    }
`
class Home extends Component {

    componentDidMount = () => {
        document.title = 'Open Research Knowledge Graph'
    }

    render = () => {
        return (
            <div>
                <StyledAbout>
                    <Container className="box pt-4 pb-4 pl-4 pr-4 aboutContent">
                        <div className="row">
                            <div className="col-md-9">
                                <h1><span>O</span>pen <span>R</span>esearch <span>K</span>nowledge <span>G</span>raph</h1>
                                <div className="mt-4">
                                    <p className="mb-0">The ORKG aims to describe research papers and contributions in a structured manner. With ORKG research contributions become findable and comparable. In order to add your own research, or to contribute,</p>
                                </div>
                            </div>
                            <div className="col-md-3 about-link">
                                <a href="https://projects.tib.eu/orkg/" target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg btn-block btn-default">Learn More!</a>
                            </div>
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
            </div>
        );
    }
}

export default Home;