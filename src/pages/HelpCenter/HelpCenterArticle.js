import CheckSlug from 'components/CheckSlug/CheckSlug';
import usePage from 'components/Page/usePage';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import NotFound from 'pages/NotFound';
import { useEffect } from 'react';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, Container } from 'reactstrap';
import { getHelpArticle } from 'services/cms';

const HelpCenterArticle = () => {
    const { loadPage, page, isLoading, isNotFound } = usePage();
    const params = useParams();

    useEffect(() => {
        if (!params?.id) {
            return;
        }
        const pagePromise = getHelpArticle(params.id);
        loadPage({ pagePromise });
    }, [params, loadPage]);

    if (isNotFound) {
        return <NotFound />;
    }

    return (
        <div>
            {!isLoading && params?.id && page?.title && <CheckSlug label={page.title} route={ROUTES.HELP_CENTER_ARTICLE} />}

            <Container>
                <h1 className="h4 mt-4 mb-4">Help center</h1>
            </Container>

            <Container className="box rounded pt-4 pb-4 pl-5 pr-5">
                {isLoading && 'Loading...'}

                {!isLoading && page && (
                    <>
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <Link to={ROUTES.HELP_CENTER}>Help center</Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <Link
                                    to={reverse(ROUTES.HELP_CENTER_CATEGORY, {
                                        id: page.help_category.id
                                    })}
                                >
                                    {page.help_category.title}
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem active>{page.title}</BreadcrumbItem>
                        </Breadcrumb>
                        <h1 className="h3 my-4">{page.title}</h1>
                        {page?.content}
                    </>
                )}
            </Container>
        </div>
    );
};

export default HelpCenterArticle;
