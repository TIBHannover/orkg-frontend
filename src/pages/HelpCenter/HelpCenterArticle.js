import usePage from 'components/Page/usePage';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import NotFound from 'pages/NotFound';
import { useEffect } from 'react';
import { Redirect, useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, Container } from 'reactstrap';

const HelpCenterArticle = () => {
    const { loadPage, page, isLoading, isNotFound } = usePage();
    const params = useParams();

    useEffect(() => {
        if (!params?.id) {
            return;
        }
        loadPage({ id: params.id, categoryId: parseInt(params.categoryId) });
    }, [params, loadPage]);

    if (isNotFound) {
        return <NotFound />;
    }

    if (page && page.slug !== params.slug && page.id === parseInt(params.id)) {
        return <Redirect to={{ pathname: reverse(ROUTES.HELP_CENTER_ARTICLE, { ...params, slug: page.slug }), state: { status: 301 } }} />;
    }
    console.log('page?.content', page?.content);
    return (
        <div>
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
                                        id: page.category.id
                                    })}
                                >
                                    {page.category.title}
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem active>Data</BreadcrumbItem>
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
