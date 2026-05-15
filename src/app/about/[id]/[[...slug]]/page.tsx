import { Metadata } from 'next';
import { Suspense } from 'react';

import { loadAboutPage } from '@/app/about/[id]/[[...slug]]/about-page-data';
import AboutPageContent from '@/app/about/[id]/[[...slug]]/AboutPageContent';
import PageContentLoader from '@/components/Page/PageContentLoader';
import { Container } from '@/components/Ui/Structure/Container';

export async function generateMetadata({ params }: { params: Promise<{ id: string; slug?: string[] }> }): Promise<Metadata> {
    const { id } = await params;
    const numericId = parseInt(id, 10);
    if (Number.isNaN(numericId)) {
        return {};
    }

    const pageData = await loadAboutPage(numericId);
    if (!pageData) {
        return { title: 'Page not found - ORKG' };
    }

    const title = `${pageData.attributes?.title ?? ''} - ORKG`;
    return { title };
}

export default function AboutPage({ params }: { params: Promise<{ id: string; slug?: string[] }> }) {
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
            <AboutPageContent params={params} />
        </Suspense>
    );
}
