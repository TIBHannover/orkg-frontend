import { faBug } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { BotInfo, BrowserInfo, detect, NodeInfo, ReactNativeInfo, SearchBotDeviceInfo } from 'detect-browser';
import Link from 'next/link';
import { FC, useEffect, useState } from 'react';

import Logo from '@/assets/img/logo.svg';
import Button from '@/components/Ui/Button/Button';
import Card from '@/components/Ui/Card/Card';
import CardBody from '@/components/Ui/Card/CardBody';
import Collapse from '@/components/Ui/Nav/Collapse';
import Container from '@/components/Ui/Structure/Container';
import ROUTES from '@/constants/routes';

type ErrorFallbackProps = {
    error: Error;
};

const ErrorFallback: FC<ErrorFallbackProps> = ({ error }) => {
    const [collapse, setCollapse] = useState<boolean>(false);
    const browser: BrowserInfo | SearchBotDeviceInfo | BotInfo | NodeInfo | ReactNativeInfo | null = detect();

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
                            <FontAwesomeIcon icon={faBug} className="text-primary mt-3 mb-3" style={{ fontSize: 30 }} />
                            <div className="mb-4 lead">We're sorry about this! Please try again or report an issue to help fix this problem</div>
                            <Button tag={Link} href={ROUTES.HOME} color="primary" className="me-3 mb-1">
                                Back to home
                            </Button>
                            <Button
                                tag="a"
                                href={`https://gitlab.com/TIBHannover/orkg/orkg-frontend/-/issues/new?issue[title]=${error}&issue[description]=%0A%0A%0A%23%23%23 Error details%0AError: ${error}%0A%0ALocation: ${
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
                            <Button onClick={() => setCollapse((v) => !v)} size="sm" color="link" className="d-inline-block px-0 text-muted">
                                Show error details
                            </Button>
                        </div>
                        <Collapse isOpen={collapse}>
                            <Card>
                                <CardBody>
                                    <b>Error:</b> {error?.message}
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

export default ErrorFallback;
