import CheckSlug from 'components/CheckSlug/CheckSlug';
import PageContentLoader from 'components/Page/PageContentLoader';
import usePage from 'components/Page/usePage';
import { CmsPage } from 'components/styled';
import TitleBar from 'components/TitleBar/TitleBar';
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

    useEffect(() => {
        document.title = `${page?.title ?? ''} - ORKG`;
    }, [page]);

    if (isNotFound) {
        return <NotFound />;
    }

    return (
        <div>
            {!isLoading && params?.id && page?.title && <CheckSlug label={page.title} route={ROUTES.HELP_CENTER_ARTICLE} />}

            <TitleBar>Help center</TitleBar>

            <Container className="box rounded pt-4 pb-4 ps-5 pe-5">
                {isLoading && <PageContentLoader />}

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
                        <CmsPage>{page?.content}</CmsPage>
                    </>
                )}
            </Container>
        </div>
    );
};

export default HelpCenterArticle;
