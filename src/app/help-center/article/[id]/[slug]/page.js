'use client';

import Link from 'components/NextJsMigration/Link';
import CheckSlug from 'components/CheckSlug/CheckSlug';
import PageContentLoader from 'components/Page/PageContentLoader';
import usePage from 'components/Page/usePage';
import { CmsPage } from 'components/styled';
import TitleBar from 'components/TitleBar/TitleBar';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import NotFound from 'app/not-found';
import { useEffect } from 'react';
import useParams from 'components/NextJsMigration/useParams';
import { Breadcrumb, BreadcrumbItem, Container } from 'reactstrap';
import { getHelpArticle } from 'services/cms';

const HelpCenterArticle = () => {
    const { loadPage, page, isLoading, isNotFound } = usePage();

    const { id } = useParams();

    useEffect(() => {
        if (!id) {
            return;
        }
        const pagePromise = getHelpArticle(id);
        loadPage({ pagePromise });
    }, [id, loadPage]);

    useEffect(() => {
        document.title = `${page?.attributes?.title ?? ''} - ORKG`;
    }, [page]);

    if (isNotFound) {
        return <NotFound />;
    }

    return (
        <div>
            {!isLoading && id && page?.attributes?.title && <CheckSlug label={page?.attributes?.title} route={ROUTES.HELP_CENTER_ARTICLE} />}
            <TitleBar>Help center</TitleBar>
            <Container className="box rounded pt-4 pb-4 ps-5 pe-5">
                {isLoading && <PageContentLoader />}

                {!isLoading && page && (
                    <>
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <Link href={ROUTES.HELP_CENTER}>Help center</Link>
                            </BreadcrumbItem>
                            {page.attributes?.help_category && (
                                <BreadcrumbItem>
                                    <Link
                                        href={reverse(ROUTES.HELP_CENTER_CATEGORY, {
                                            id: page.attributes.help_category.data?.id,
                                        })}
                                    >
                                        {page.attributes.help_category.data?.attributes?.title}
                                    </Link>
                                </BreadcrumbItem>
                            )}
                            <BreadcrumbItem active>{page.attributes?.title}</BreadcrumbItem>
                        </Breadcrumb>
                        <h1 className="h3 my-4">{page.attributes?.title}</h1>
                        <CmsPage>{page.content}</CmsPage>
                    </>
                )}
            </Container>
        </div>
    );
};

export default HelpCenterArticle;
