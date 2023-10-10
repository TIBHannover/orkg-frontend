import Link from 'components/NextJsMigration/Link';
import { useEffect, useState } from 'react';
import { Button, Container, Collapse, Card, CardBody } from 'reactstrap';
import ROUTES from 'constants/routes.js';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faBug } from '@fortawesome/free-solid-svg-icons';
import Logo from 'assets/img/logo.svg';
import { detect } from 'detect-browser';
import PropTypes from 'prop-types';

const ErrorFallback = props => {
    const [collapse, setCollapse] = useState(false);
    const browser = detect();

    useEffect(() => {
        document.title = 'Something went wrong - ORKG';
    }, []);

    return (
        <div>
            <Container className="py-4 px-2">
                <Link href={ROUTES.HOME} color="primary" className="me-3 mb-1">
                    <Logo />
                </Link>
            </Container>
            <Container className="box rounded pt-4 pb-4 ps-5 pe-5">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-12 text-center">
                            <h1 className="display-6 d-block">Something went wrong!</h1>
                            <Icon icon={faBug} className="text-primary mt-3 mb-3" style={{ fontSize: 30 }} />
                            <div className="mb-4 lead">We're sorry about this! Please try again or report an issue to help fix this problem</div>
                            <Button tag={Link} href={ROUTES.HOME} color="primary" className="me-3 mb-1">
                                Back to home
                            </Button>
                            <Button
                                tag="a"
                                href={`https://gitlab.com/TIBHannover/orkg/orkg-frontend/-/issues/new?issue[title]=${
                                    props.error
                                }&issue[description]=%0A%0A%0A%23%23%23 Error details%0AError: ${props.error}%0A%0ALocation: ${
                                    window?.location.href
                                }%0A%0ABrowser: ${JSON.stringify(browser)}`}
                                color="primary"
                                outline
                                className="me-3 mb-1"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Report an issue in Gitlab
                            </Button>
                        </div>
                        <div>
                            <Button onClick={() => setCollapse(v => !v)} size="sm" color="link" className="d-inline-block px-0 text-muted">
                                Show error details
                            </Button>
                        </div>
                        <Collapse isOpen={collapse}>
                            <Card>
                                <CardBody>
                                    <b>Error:</b> {props.error?.message}
                                    <br />
                                    <b>Location:</b> {window?.location.href}
                                    <br />
                                    <b>Browser:</b> {JSON.stringify(browser)}
                                </CardBody>
                            </Card>
                        </Collapse>
                    </div>
                </div>
            </Container>
        </div>
    );
};

ErrorFallback.propTypes = {
    error: PropTypes.object,
};

export default ErrorFallback;
