'use client';

import PageContentLoader from 'components/Page/PageContentLoader';
import usePage from 'components/Page/usePage';
import { CmsPage } from 'components/styled';
import TitleBar from 'components/TitleBar/TitleBar';
import NotFound from 'app/not-found';
import { useEffect } from 'react';
import useParams from 'components/NextJsMigration/useParams';
import { Container } from 'reactstrap';
import { getPageByUrl } from 'services/cms';

const Page = () => {
    const { loadPage, page, isLoading, isNotFound } = usePage();
    const { url } = useParams();

    useEffect(() => {
        if (!url) {
            return;
        }
        const pagePromise = getPageByUrl(url);
        loadPage({ pagePromise });
    }, [url, loadPage]);

    useEffect(() => {
        document.title = `${page?.attributes?.title ?? ''} - ORKG`;
    }, [page]);

    if (isNotFound) {
        return <NotFound />;
    }

    return (
        <div>
            <TitleBar>{page?.attributes.title}</TitleBar>

            <Container className="box rounded pt-4 pb-4 ps-5 pe-5">
                {isLoading && <PageContentLoader />}

                <CmsPage>{!isLoading && page?.content}</CmsPage>
            </Container>
        </div>
    );
};

export default Page;
