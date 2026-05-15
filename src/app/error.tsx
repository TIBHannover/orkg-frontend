'use client';

import { faBug } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { sendEvent } from '@socialgouv/matomo-next';
import { detect } from 'detect-browser';
import Link from 'next/link';
import { useEffect } from 'react';

import TitleBar from '@/components/TitleBar/TitleBar';
import Button from '@/components/Ui/Button/Button';
import Container from '@/components/Ui/Structure/Container';
import ROUTES from '@/constants/routes';

const InternalServerError = ({ error }: { error?: Error & { digest?: string } }) => {
    useEffect(() => {
        // log the error as matomo event
        const browser = detect();
        sendEvent({
            category: 'errors',
            action: error?.toString().replace(' ', '') || 'InternalServerError',
            name: `Location ${window.location.href} Browser:${JSON.stringify(browser)}`,
        });
    }, [error]);

    return (
        <div>
            <TitleBar>An error has occurred</TitleBar>
            <Container>
                <div className="box rounded pt-6 pb-6 pl-12 pr-12">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-wrap items-stretch justify-center">
                            <div className="w-full md:shrink-0 md:grow-0 md:w-12/12 md:basis-12/12 md:max-w-12/12 text-center">
                                <span className="display-1 block">500</span>
                                <FontAwesomeIcon icon={faBug} className="text-accent mt-4 mb-4" style={{ fontSize: 25 }} />
                                <div className="mb-6 lead">Internal Server Error.</div>
                                <Link href={ROUTES.HOME}>
                                    <Button color="primary" className="mr-4">
                                        Back to home
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default InternalServerError;
