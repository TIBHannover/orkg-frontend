import usePage from 'components/Page/usePage';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import NotFound from 'pages/NotFound';
import { useEffect } from 'react';
import { Redirect, useParams } from 'react-router';
import { Container } from 'reactstrap';

const Page = () => {
    const { loadPage, page, isLoading, isNotFound } = usePage();
    const params = useParams();

    useEffect(() => {
        if (!params?.id) {
            return;
        }
        loadPage({ id: params.id });
    }, [params, loadPage]);

    if (isNotFound) {
        return <NotFound />;
    }

    if (page && page.slug !== params.slug && page.id === parseInt(params.id)) {
        return <Redirect to={{ pathname: reverse(ROUTES.PAGE, { ...params, slug: page.slug }), state: { status: 301 } }} />;
    }

    return (
        <div>
            <Container>
                <h1 className="h4 mt-4 mb-4">{page?.title}</h1>
            </Container>

            <Container className="box rounded pt-4 pb-4 pl-5 pr-5">
                {isLoading && 'Loading...'}

                {!isLoading && (
                    <>
                        <h1>{page?.title}</h1>
                        {page?.content}
                    </>
                )}
            </Container>
        </div>
    );
};

export default Page;
