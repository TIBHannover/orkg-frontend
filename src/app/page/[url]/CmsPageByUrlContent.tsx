import { notFound } from 'next/navigation';

import { loadCmsPageByUrl } from '@/app/page/[url]/cms-page-by-url-data';
import TitleBar from '@/components/TitleBar/TitleBar';
import Container from '@/components/Ui/Structure/Container';
import { parseMarkdown } from '@/lib/markdown';

type CmsPageByUrlContentProps = {
    params: Promise<{ url: string }>;
};

const cmsProseClass = 'prose mt-4 [&_img]:max-w-full [&_img]:h-auto';

export default async function CmsPageByUrlContent({ params }: CmsPageByUrlContentProps) {
    const { url } = await params;
    if (!url) {
        notFound();
    }

    const pageData = await loadCmsPageByUrl(url);
    if (!pageData) {
        notFound();
    }

    const html = parseMarkdown(pageData.attributes?.content ?? '');

    return (
        <div>
            <TitleBar>{pageData.attributes?.title}</TitleBar>
            <Container>
                <div className="box rounded pt-6 pb-6 pl-12 pr-12">
                    <div className={cmsProseClass} dangerouslySetInnerHTML={{ __html: html }} />
                </div>
            </Container>
        </div>
    );
}
