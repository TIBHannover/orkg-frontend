'use client';

import { faBug } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { useEffect } from 'react';

import TitleBar from '@/components/TitleBar/TitleBar';
import Button from '@/components/Ui/Button/Button';
import Container from '@/components/Ui/Structure/Container';
import ROUTES from '@/constants/routes';

const NotFound = () => {
    useEffect(() => {
        document.title = 'Page not found - ORKG';
    }, []);
    return (
        <div>
            <TitleBar>An error has occurred</TitleBar>
            <Container>
                <div className="box rounded pt-6 pb-6 pl-12 pr-12">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-wrap items-stretch justify-center">
                            <div className="w-full md:shrink-0 md:grow-0 md:w-12/12 md:basis-12/12 md:max-w-12/12 text-center">
                                <span className="display-1 block">404</span>
                                <FontAwesomeIcon icon={faBug} className="text-accent mt-4 mb-4" style={{ fontSize: 25 }} />
                                <div className="mb-6 lead">The page you are looking for was not found.</div>
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

export default NotFound;
