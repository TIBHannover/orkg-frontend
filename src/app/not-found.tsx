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
            <Container className="box rounded pt-4 pb-4 ps-5 pe-5">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-12 text-center">
                            <span className="display-1 d-block">404</span>
                            <FontAwesomeIcon icon={faBug} className="text-primary mt-3 mb-3" style={{ fontSize: 25 }} />
                            <div className="mb-4 lead">The page you are looking for was not found.</div>
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

export default NotFound;
