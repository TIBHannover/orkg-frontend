'use client';

import { faPython } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { env } from 'next-runtime-env';
import TitleBar from 'components/TitleBar/TitleBar';
import { useEffect } from 'react';
import { Button, Card, CardText, CardTitle, Col, Container, Row } from 'reactstrap';

const Data = () => {
    useEffect(() => {
        document.title = 'Data access - ORKG';
    }, []);

    return (
        <div>
            <TitleBar>Data access</TitleBar>
            <Container className="box rounded pt-4 pb-4 ps-5 pe-5">
                <Row className="mb-4">
                    <Col sm="6" className="mt-4">
                        <Card body>
                            <CardTitle tag="h2" className="h5">
                                REST API
                            </CardTitle>
                            <CardText>You can access the Data by using the our REST API.</CardText>
                            <Button
                                color="secondary"
                                className="me-3 ps-4 pe-4 flex-shrink-0"
                                tag="a"
                                target="_blank"
                                rel="noopener noreferrer"
                                href="http://tibhannover.gitlab.io/orkg/orkg-backend/api-doc/"
                            >
                                API Documentation
                            </Button>
                        </Card>
                    </Col>
                    <Col sm="6" className="mt-4">
                        <Card body>
                            <CardTitle tag="h2" className="h5">
                                <Icon icon={faPython} /> Python Package
                            </CardTitle>
                            <CardText>Python package wrapping the ORKG API</CardText>
                            <Button
                                color="secondary"
                                className="me-3 ps-4 pe-4 flex-shrink-0"
                                tag="a"
                                target="_blank"
                                rel="noopener noreferrer"
                                href="https://pypi.org/project/orkg/"
                            >
                                Python Package
                            </Button>
                        </Card>
                    </Col>
                    <Col sm="6" className="mt-4">
                        <Card body className="pb-3">
                            <CardTitle tag="h2" className="h5">
                                SPARQL endpoint
                            </CardTitle>
                            <CardText>You can access the following SPARQL endpoint to explore our data using SPARQL queries.</CardText>
                            <Row>
                                <Col>
                                    <Button
                                        color="secondary"
                                        className="ps-4 pe-4 mb-1 d-block"
                                        tag="a"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href={`${env('NEXT_PUBLIC_URL')}/triplestore`}
                                    >
                                        Virtuoso Query Editor
                                    </Button>
                                </Col>
                                <Col>
                                    <Button
                                        color="secondary"
                                        className="ps-4 pe-4 d-block"
                                        tag="a"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href={`${env('NEXT_PUBLIC_URL')}/sparql`}
                                    >
                                        Visual SPARQL Editor
                                    </Button>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                    <Col sm="6" className="mt-4">
                        <Card body>
                            <CardTitle tag="h2" className="h5">
                                Export data: RDF Dump
                            </CardTitle>
                            <CardText>You can download the Open Research Knowledge Graph RDF Dump in N-Triples format below</CardText>
                            <Button
                                color="secondary"
                                className="me-3 ps-4 pe-4 flex-shrink-0"
                                tag="a"
                                target="_blank"
                                rel="noopener noreferrer"
                                href={`${env('NEXT_PUBLIC_URL')}/api/rdf/dump`}
                            >
                                Download RDF dump
                            </Button>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Data;
