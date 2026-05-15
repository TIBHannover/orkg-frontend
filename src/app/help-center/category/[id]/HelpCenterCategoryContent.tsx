import { Breadcrumbs } from '@heroui/react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { loadHelpCategory } from '@/app/help-center/category/[id]/help-category-data';
import TitleBar from '@/components/TitleBar/TitleBar';
import ROUTES from '@/constants/routes';
import { reverseWithSlug } from '@/utilsTyped';

type HelpCenterCategoryContentProps = {
    params: Promise<{ id: string }>;
};

export default async function HelpCenterCategoryContent({ params }: HelpCenterCategoryContentProps) {
    const { id } = await params;
    if (!id) {
        notFound();
    }

    const category = await loadHelpCategory(id);
    if (!category) {
        notFound();
    }

    const articles = category.attributes?.help_articles?.data ?? [];

    return (
        <div>
            <TitleBar>Help center</TitleBar>
            <div className="max-w-container mx-auto px-3">
                <div className="box rounded p-8 md:p-12">
                    <Breadcrumbs className="mb-4">
                        <Breadcrumbs.Item href={ROUTES.HELP_CENTER}>Help center</Breadcrumbs.Item>
                        <Breadcrumbs.Item>{category.attributes?.title}</Breadcrumbs.Item>
                    </Breadcrumbs>

                    <h1 className="text-2xl md:text-3xl font-semibold mb-6">{category.attributes?.title}</h1>

                    <ul className="flex flex-col gap-2 list-disc list-outside pl-5">
                        {articles.map((article) => (
                            <li key={article.id}>
                                <Link
                                    href={reverseWithSlug(ROUTES.HELP_CENTER_ARTICLE, {
                                        id: article.id,
                                        slug: article.attributes?.title,
                                    })}
                                    className="hover:underline"
                                >
                                    {article.attributes?.title}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
