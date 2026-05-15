import { Breadcrumbs } from '@heroui/react';
import { notFound, redirect } from 'next/navigation';

import { loadHelpArticle } from '@/app/help-center/article/[id]/[slug]/help-article-data';
import TitleBar from '@/components/TitleBar/TitleBar';
import Container from '@/components/Ui/Structure/Container';
import ROUTES from '@/constants/routes';
import { parseMarkdown } from '@/lib/markdown';
import { reverse } from '@/lib/namedRoute';
import { reverseWithSlug, slugify } from '@/utilsTyped';

type HelpCenterArticleContentProps = {
    params: Promise<{ id: string; slug: string }>;
};

const cmsProseClass = 'prose mt-4 [&_img]:max-w-full [&_img]:h-auto';

export default async function HelpCenterArticleContent({ params }: HelpCenterArticleContentProps) {
    const { id, slug: slugParam } = await params;
    if (!id) {
        notFound();
    }

    const pageData = await loadHelpArticle(id);
    if (!pageData) {
        notFound();
    }

    const title = pageData.attributes?.title ?? '';
    const expectedSlug = slugify(title);
    if (title && decodeURIComponent(slugParam) !== expectedSlug) {
        redirect(reverseWithSlug(ROUTES.HELP_CENTER_ARTICLE, { id, slug: title }));
    }

    const html = parseMarkdown(pageData.attributes?.content ?? '');

    return (
        <div>
            <TitleBar>Help center</TitleBar>
            <Container>
                <div className="box rounded pt-6 pb-6 pl-12 pr-12">
                    <Breadcrumbs className="gap-1">
                        <Breadcrumbs.Item href={ROUTES.HELP_CENTER}>Help center</Breadcrumbs.Item>
                        {pageData.attributes?.help_category?.data && (
                            <Breadcrumbs.Item
                                href={reverse(ROUTES.HELP_CENTER_CATEGORY, {
                                    id: pageData.attributes.help_category.data?.id,
                                })}
                            >
                                {pageData.attributes.help_category.data?.attributes?.title}
                            </Breadcrumbs.Item>
                        )}
                        <Breadcrumbs.Item>{pageData.attributes?.title}</Breadcrumbs.Item>
                    </Breadcrumbs>
                    <h1 className="text-3xl my-6">{pageData.attributes?.title}</h1>
                    <div className={cmsProseClass} dangerouslySetInnerHTML={{ __html: html }} />
                </div>
            </Container>
        </div>
    );
}
