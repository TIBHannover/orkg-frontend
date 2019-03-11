import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

class Home extends Component {
    render() {
        return (<div>
            <Container className="box pt-4 pb-4 pl-5 pr-5 mt-5">
                <FontAwesomeIcon icon={faInfoCircle} /> The <strong>Open Research Knowledge Graph</strong> - or - ORKG aims to describe research papers and contributions in a structured manner. With ORKG research contributions become findable and comparable. In order to add your own research, or to contribute,
                {' '}<a href="">learn more</a>
            </Container>

            <Container className="mt-4">
                <Row>
                    <Col className="col-sm-7 px-0">
                        <div className="box mr-4 p-4">
                            Browse by research field
                        </div>
                    </Col>
                    <Col className="col-sm-5 px-0">
                        <div className="box p-4">
                            Recently added papers
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
        );
    }
}

export default Home;