import PageContentLoader from 'components/Page/PageContentLoader';
import usePage from 'components/Page/usePage';
import { CmsPage } from 'components/styled';
import TitleBar from 'components/TitleBar/TitleBar';
import NotFound from 'pages/NotFound';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container } from 'reactstrap';
import { getPageByUrl } from 'services/cms';

const Page = () => {
    const { loadPage, page, isLoading, isNotFound } = usePage();
    const params = useParams();

    useEffect(() => {
        if (!params.url) {
            return;
        }
        const pagePromise = getPageByUrl(params.url);
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
            <TitleBar>{page?.title}</TitleBar>

            <Container className="box rounded pt-4 pb-4 ps-5 pe-5">
                {isLoading && <PageContentLoader />}

                <CmsPage>{!isLoading && page?.content}</CmsPage>
            </Container>
        </div>
    );
};

export default Page;
