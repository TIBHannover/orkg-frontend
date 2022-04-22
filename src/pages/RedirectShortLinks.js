import { useEffect, useState } from 'react';
import { Container } from 'reactstrap';
import { getLongLink } from 'services/similarity/index';
import { useParams } from 'react-router-dom-v5-compat';

const RedirectShortLinks = () => {
    const params = useParams();

    const [isLoading] = useState(true);

    useEffect(() => {
        getLongLink(params.shortCode).then(data => {
            window.location.href = data.long_url;
            return null;
        });
    }, [params.shortCode]);

    return (
        <>
            {isLoading && (
                <Container className="p-0 d-flex align-items-center">
                    <h1 className="h5 mt-4 mb-4 ">Redirection....</h1>
                </Container>
            )}
        </>
    );
};

export default RedirectShortLinks;
