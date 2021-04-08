import { useEffect } from 'react';
import { Container, Button, Card, CardTitle, CardText, Row, Col } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPython } from '@fortawesome/free-brands-svg-icons';

const Data = () => {
    useEffect(() => {
        document.title = 'Data Access - ORKG';
    }, []);

    return (
        <div>
            <Container>
                <h1 className="h4 mt-4 mb-4">Data Access</h1>
            </Container>
            <Container className="box rounded pt-4 pb-4 pl-5 pr-5">
                <Row className="mb-4">
                    <Col sm="6" className="mt-4">
                        <Card body>
                            <CardTitle tag="h5">REST API</CardTitle>
                            <CardText>You can access the Data by using the our REST API.</CardText>
                            <Button
                                color="secondary"
                                className="mr-3 pl-4 pr-4 flex-shrink-0"
                                tag="a"
                                target="_blank"
                                rel="noopener noreferrer"
                                href="https://www.orkg.org/orkg/doc/api/"
                            >
                                API Documentation
                            </Button>
                        </Card>
                    </Col>
                    <Col sm="6" className="mt-4">
                        <Card body>
                            <CardTitle tag="h5">
                                <Icon icon={faPython} /> Python Package
                            </CardTitle>
                            <CardText>Python package wrapping the ORKG API</CardText>
                            <Button
                                color="secondary"
                                className="mr-3 pl-4 pr-4 flex-shrink-0"
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
                        <Card body>
                            <CardTitle tag="h5">SPARQL endpoint</CardTitle>
                            <CardText>You can access the following SPARQL endpoint to explore our data using SPARQL queries.</CardText>
                            <Button
                                color="secondary"
                                className="mr-3 pl-4 pr-4 flex-shrink-0"
                                tag="a"
                                target="_blank"
                                rel="noopener noreferrer"
                                href="https://www.orkg.org/orkg/triplestore"
                            >
                                Go to SPARQL endpoint
                            </Button>
                        </Card>
                    </Col>
                    <Col sm="6" className="mt-4">
                        <Card body>
                            <CardTitle tag="h5">Export data: RDF Dump</CardTitle>
                            <CardText>You can download the Open Research Knowledge Graph RDF Dump in N-Triples format below</CardText>
                            <Button
                                color="secondary"
                                className="mr-3 pl-4 pr-4 flex-shrink-0"
                                tag="a"
                                target="_blank"
                                rel="noopener noreferrer"
                                href="https://orkg.org/orkg/api/rdf/dump"
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
