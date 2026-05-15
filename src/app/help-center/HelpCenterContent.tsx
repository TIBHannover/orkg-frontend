import { Alert } from '@heroui/react';
import Link from 'next/link';

import HelpCenterSearchInput from '@/components/HelpCenterSearchInput/HelpCenterSearchInput';
import TitleBar from '@/components/TitleBar/TitleBar';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { getHelpCategories } from '@/services/cms';
import { HelpArticle } from '@/services/cms/types';
import { reverseWithSlug } from '@/utilsTyped';

export default async function HelpCenterContent() {
    let categories: HelpArticle[] = [];
    let hasFailed = false;
    try {
        categories = (await getHelpCategories()).data;
    } catch {
        hasFailed = true;
    }

    return (
        <div>
            <TitleBar>Help center</TitleBar>
            <div className="max-w-container mx-auto px-3">
                <div className="box rounded p-8 md:p-12">
                    <div className="max-w-2xl mx-auto text-center mb-10">
                        <h1 className="text-3xl md:text-4xl font-semibold mb-3">How can we help?</h1>
                        <p className="text-muted mb-6">Search help articles or browse the categories below.</p>
                        <HelpCenterSearchInput />
                    </div>

                    {hasFailed && (
                        <Alert status="danger" className="mb-6">
                            <Alert.Indicator />
                            <Alert.Content>
                                <Alert.Title>Help categories failed to load</Alert.Title>
                                <Alert.Description>An error occurred while fetching the help categories. Please try again later.</Alert.Description>
                            </Alert.Content>
                        </Alert>
                    )}

                    {!hasFailed && categories.length === 0 && (
                        <Alert className="mb-6">
                            <Alert.Indicator />
                            <Alert.Content>
                                <Alert.Title>No help categories yet</Alert.Title>
                                <Alert.Description>There are no help categories to display.</Alert.Description>
                            </Alert.Content>
                        </Alert>
                    )}

                    {categories.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                            {categories.map((category) => {
                                const articles = category.attributes?.help_articles?.data ?? [];
                                const categoryHref = reverse(ROUTES.HELP_CENTER_CATEGORY, { id: category.id });
                                return (
                                    <section key={category.id} className="flex flex-col">
                                        <h2 className="text-xl font-semibold mb-3">
                                            <Link href={categoryHref} className="text-body hover:underline">
                                                {category.attributes.title}
                                            </Link>
                                        </h2>
                                        <ul className="flex flex-col gap-1.5 list-disc list-outside pl-5 mb-3">
                                            {articles.slice(0, 5).map((article) => (
                                                <li key={article.id}>
                                                    <Link
                                                        href={reverseWithSlug(ROUTES.HELP_CENTER_ARTICLE, {
                                                            id: article.id,
                                                            slug: article.attributes.title,
                                                        })}
                                                        className="hover:underline"
                                                    >
                                                        {article.attributes.title}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                        {articles.length > 5 && (
                                            <Link href={categoryHref} className="text-sm text-muted hover:underline mt-auto">
                                                View all {articles.length} articles →
                                            </Link>
                                        )}
                                    </section>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
