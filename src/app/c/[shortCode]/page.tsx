'use client';

import { useEffect, useState } from 'react';
import { Container } from 'reactstrap';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes';
import { useRouter } from 'next/navigation';
import useParams from 'components/useParams/useParams';

const RedirectShortLinks = () => {
    const { shortCode } = useParams();
    const router = useRouter();
    const [isLoading] = useState(true);

    useEffect(() => {
        router.push(`${reverse(ROUTES.COMPARISON, { comparisonId: shortCode })}?noResource=true`);
    }, [router, shortCode]);

    return (
        <Container className="p-0 d-flex align-items-center">
            <h1 className="h5 mt-4 mb-4 ">{isLoading && 'Redirection....'}</h1>
        </Container>
    );
};

export default RedirectShortLinks;
