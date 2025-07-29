'use client';

import { faBug } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMatomo } from '@jonkoops/matomo-tracker-react';
import { detect } from 'detect-browser';
import Link from 'next/link';
import { useEffect } from 'react';
import { Container } from 'reactstrap';

import TitleBar from '@/components/TitleBar/TitleBar';
import Button from '@/components/Ui/Button/Button';
import ROUTES from '@/constants/routes';

const InternalServerError = ({ error }: { error?: Error & { digest?: string } }) => {
    const { trackEvent } = useMatomo();

    useEffect(() => {
        // log the error as matomo event
        const browser = detect();
        trackEvent({
            category: 'errors',
            action: error?.toString().replace(' ', '') || 'InternalServerError',
            name: `Location ${window.location.href} Browser:${JSON.stringify(browser)}`,
        });
    }, [error, trackEvent]);

    return (
        <div>
            <TitleBar>An error has occurred</TitleBar>
            <Container className="box rounded pt-4 pb-4 ps-5 pe-5">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-12 text-center">
                            <span className="display-1 d-block">500</span>
                            <FontAwesomeIcon icon={faBug} className="text-primary mt-3 mb-3" style={{ fontSize: 25 }} />
                            <div className="mb-4 lead">Internal Server Error.</div>
                            <Link href={ROUTES.HOME}>
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
};

export default InternalServerError;
