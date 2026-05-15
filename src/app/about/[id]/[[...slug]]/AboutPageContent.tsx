import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { cn } from 'tailwind-variants';

import { loadAboutPage } from '@/app/about/[id]/[[...slug]]/about-page-data';
import TitleBar from '@/components/TitleBar/TitleBar';
import Alert from '@/components/Ui/Alert/Alert';
import Container from '@/components/Ui/Structure/Container';
import ROUTES from '@/constants/routes';
import { parseMarkdown } from '@/lib/markdown';
import { getAboutPages } from '@/services/cms';
import { HelpArticle } from '@/services/cms/types';
import { reverseWithSlug, slugify } from '@/utilsTyped';

type AboutPageContentProps = {
    params: Promise<{ id: string; slug?: string[] }>;
};

const cmsProseClass = 'prose [&_img]:max-w-full [&_img]:h-auto mt-4';

export default async function AboutPageContent({ params }: AboutPageContentProps) {
    const { id: idParam, slug: slugSegments } = await params;
    const id = parseInt(idParam, 10);
    if (Number.isNaN(id)) {
        notFound();
    }

    const pageData = await loadAboutPage(id);
    if (!pageData) {
        notFound();
    }

    const title = pageData.attributes?.title ?? '';
    const expectedSlug = slugify(title);
    const slugSegment = decodeURIComponent(slugSegments?.[0] ?? '');
    if (title && slugSegment !== expectedSlug) {
        redirect(reverseWithSlug(ROUTES.ABOUT, { id: id.toString(), slug: title }));
    }

    const categoryId = pageData.attributes?.category?.data?.id;
    let menuItems: HelpArticle[] = [];
    let menuError = false;
    if (categoryId != null) {
        try {
            const menuRes = await getAboutPages(categoryId);
            menuItems = menuRes?.data ?? [];
        } catch (e) {
            console.error(e);
            menuError = true;
        }
    }

    const titleBarLabel = pageData.category?.label ?? pageData.attributes?.title;
    const html = parseMarkdown(pageData.attributes?.content ?? '');

    return (
        <div>
            <TitleBar>{titleBarLabel}</TitleBar>
            <Container>
                <div className="box rounded pt-6 pb-6 pl-12 pr-12">
                    {!menuError && menuItems.length > 1 && (
                        <nav className="mb-6 flex flex-wrap gap-x-1 gap-y-2 border-b border-default" aria-label="Pages in this category">
                            {menuItems.map((item) => {
                                const isActive = item.id === pageData.id;
                                return (
                                    <Link
                                        key={item.id}
                                        aria-current={isActive ? 'page' : undefined}
                                        className={cn(
                                            '-mb-px inline-flex items-center border-b-2 border-transparent px-3 py-2.5 text-sm font-medium no-underline text-foreground/65 transition-colors hover:text-foreground hover:border-default-300',
                                            isActive && 'text-primary border-primary hover:text-primary hover:border-primary',
                                        )}
                                        href={reverseWithSlug(ROUTES.ABOUT, {
                                            id: item.id.toString(),
                                            slug: item.attributes?.title,
                                        })}
                                    >
                                        {item.attributes?.title}
                                    </Link>
                                );
                            })}
                        </nav>
                    )}

                    {menuError && <Alert color="danger">Failed loading menu</Alert>}

                    <div className={cmsProseClass} dangerouslySetInnerHTML={{ __html: html }} />
                </div>
            </Container>
        </div>
    );
}
