import React, { Component } from 'react';
import { Button, Container } from 'reactstrap';
import { Link } from 'react-router-dom';
import ROUTES from 'constants/routes.js';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faBug } from '@fortawesome/free-solid-svg-icons';

class InternalServerError extends Component {
    componentDidMount = () => {
        document.title = 'Internal Server Error - ORKG';
    };

    render() {
        return (
            <div>
                <Container className="p-0">
                    <h1 className="h4 mt-4 mb-4">An error has occurred</h1>
                </Container>
                <Container className="box rounded pt-4 pb-4 pl-5 pr-5">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-md-12 text-center">
                                <span className="display-1 d-block">500</span>
                                <Icon icon={faBug} className="text-primary mt-3 mb-3" style={{ fontSize: 25 }} />
                                <div className="mb-4 lead">Internal Server Error.</div>
                                <Link to={ROUTES.HOME}>
                                    <Button color="primary" className="mr-3">
                                        Back to home
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </Container>
            </div>
        );
    }
}

export default InternalServerError;
