import { Component } from 'react';
import { Button, Container } from 'reactstrap';
import { Link } from 'react-router-dom';
import ROUTES from 'constants/routes.js';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faBug } from '@fortawesome/free-solid-svg-icons';
import TitleBar from 'components/TitleBar/TitleBar';

class InternalServerError extends Component {
    componentDidMount = () => {
        document.title = 'Internal Server Error - ORKG';
    };

    render() {
        return (
            <div>
                <TitleBar>An error has occurred</TitleBar>
                <Container className="box rounded pt-4 pb-4 ps-5 pe-5">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-md-12 text-center">
                                <span className="display-1 d-block">500</span>
                                <Icon icon={faBug} className="text-primary mt-3 mb-3" style={{ fontSize: 25 }} />
                                <div className="mb-4 lead">Internal Server Error.</div>
                                <Link to={ROUTES.HOME}>
                                    <Button color="primary" className="me-3">
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
