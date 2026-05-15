import { Metadata } from 'next';
import { Suspense } from 'react';

import { loadCmsPageByUrl } from '@/app/page/[url]/cms-page-by-url-data';
import CmsPageByUrlContent from '@/app/page/[url]/CmsPageByUrlContent';
import PageContentLoader from '@/components/Page/PageContentLoader';
import { Container } from '@/components/Ui/Structure/Container';

export async function generateMetadata({ params }: { params: Promise<{ url: string }> }): Promise<Metadata> {
    const { url } = await params;
    if (!url) {
        return {};
    }

    const pageData = await loadCmsPageByUrl(url);
    if (!pageData) {
        return { title: 'Page not found - ORKG' };
    }

    const title = `${pageData.attributes?.title ?? ''} - ORKG`;
    return { title };
}

export default function CmsPageByUrlPage({ params }: { params: Promise<{ url: string }> }) {
    return (
        <Suspense
            fallback={
                <Container className="mt-12">
                    <div className="box rounded pt-6 pb-6 pl-12 pr-12">
                        <PageContentLoader />
                    </div>
                </Container>
            }
        >
            <CmsPageByUrlContent params={params} />
        </Suspense>
    );
}
