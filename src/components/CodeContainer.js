import React, {Component} from 'react';
import {Button, Card, CardBody, UncontrolledCollapse} from "reactstrap";
import '../App.css';

class CodeContainer extends Component {

    constructor(props) {
        super(props);
    }

    randId() {
        return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);
    }

    render() {
        const id = this.randId();
        return [
            <Button color="primary" id={id} className="CodeContainerButton">
                Show
            </Button>,
            <UncontrolledCollapse toggler={'#' + id}>
                <Card>
                    <CardBody>
                        <pre>{this.props.children}</pre>
                    </CardBody>
                </Card>
            </UncontrolledCollapse>
        ]
    }

}

export default CodeContainer;