import React, { Component } from 'react';
import { Button, Container } from 'reactstrap';

class License extends Component {

    render() {
        return <div>
            <Container className="p-0">
                <h1 className="h4 mt-4 mb-4">License</h1>
            </Container>
            <Container className="box pt-4 pb-4 pl-5 pr-5">
                The code and the published data in ORKG are made available under the ... license.
            </Container>
        </div>;
    }
}

export default License;