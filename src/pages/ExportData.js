import React, { Component } from 'react';
import { Container } from 'reactstrap';

class ExportData extends Component {
    componentDidMount = () => {
        document.title = 'Export data - ORKG';
    };

    render() {
        return (
            <div>
                <Container className="p-0">
                    <h1 className="h4 mt-4 mb-4">Export data</h1>
                </Container>
                <Container className="box rounded pt-4 pb-4 pl-5 pr-5">
                    <h2>RDF Dump</h2>

                    <p className="mt-4">
                        You can download the RDF Dump of Open Research Knowledge Graph from the following link :<br />{' '}
                    </p>
                    <p className="mt-1">
                        <a href="https://orkg.org/orkg/api/rdf/dump" target="_blank" rel="noopener noreferrer">
                            https://orkg.org/orkg/api/rdf/dump
                        </a>
                    </p>
                </Container>
            </div>
        );
    }
}

export default ExportData;
