import { Component } from 'react';
import { Container, Button } from 'reactstrap';

class ExportData extends Component {
    componentDidMount = () => {
        document.title = 'Export data - ORKG';
    };

    render() {
        return (
            <div>
                <Container>
                    <h1 className="h4 mt-4 mb-4">Export data</h1>
                </Container>
                <Container className="box rounded pt-4 pb-4 pl-5 pr-5">
                    <h2>RDF Dump</h2>

                    <p className="mt-4">
                        You can download the Open Research Knowledge Graph RDF Dump in N-Triples format below
                        <br />{' '}
                    </p>
                    <p className="mt-1">
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
                    </p>
                </Container>
            </div>
        );
    }
}

export default ExportData;
