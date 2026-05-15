import { Metadata } from 'next';
import { Suspense } from 'react';

import { loadHelpArticle } from '@/app/help-center/article/[id]/[slug]/help-article-data';
import HelpCenterArticleContent from '@/app/help-center/article/[id]/[slug]/HelpCenterArticleContent';
import PageContentLoader from '@/components/Page/PageContentLoader';
import { Container } from '@/components/Ui/Structure/Container';

export async function generateMetadata({ params }: { params: Promise<{ id: string; slug: string }> }): Promise<Metadata> {
    const { id } = await params;
    if (!id) {
        return {};
    }

    const pageData = await loadHelpArticle(id);
    if (!pageData) {
        return { title: 'Page not found - ORKG' };
    }

    const title = `${pageData.attributes?.title ?? ''} - ORKG`;
    return { title };
}

export default function HelpCenterArticlePage({ params }: { params: Promise<{ id: string; slug: string }> }) {
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
            <HelpCenterArticleContent params={params} />
        </Suspense>
    );
}
