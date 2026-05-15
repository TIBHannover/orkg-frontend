import { Alert, Breadcrumbs } from '@heroui/react';
import Link from 'next/link';

import HelpCenterSearchInput from '@/components/HelpCenterSearchInput/HelpCenterSearchInput';
import TitleBar from '@/components/TitleBar/TitleBar';
import ROUTES from '@/constants/routes';
import { getHelpArticles } from '@/services/cms';
import { HelpArticle } from '@/services/cms/types';
import { reverseWithSlug } from '@/utilsTyped';

const buildSearchQuery = (searchQuery: string) => {
    const words = searchQuery.split(' ').filter(Boolean);
    let whereCount = 0;
    return words
        .map((word) => {
            const where = `filters[$or][${whereCount}][title][$containsi]=${word}&filters[$or][${whereCount + 1}][content][$containsi]=${word}`;
            whereCount += 2;
            return where;
        })
        .join('&');
};

type HelpCenterSearchContentProps = {
    params: Promise<{ searchQuery: string }>;
};

export default async function HelpCenterSearchContent({ params }: HelpCenterSearchContentProps) {
    const { searchQuery } = await params;
    const query = decodeURIComponent(searchQuery ?? '');

    let articles: HelpArticle[] = [];
    let hasFailed = false;
    if (query) {
        try {
            articles = (await getHelpArticles({ where: buildSearchQuery(query) })).data;
        } catch {
            hasFailed = true;
        }
    }

    return (
        <div>
            <TitleBar>Help center</TitleBar>
            <div className="max-w-container mx-auto px-3">
                <div className="box rounded p-8 md:p-12">
                    <div className="max-w-2xl mx-auto mb-8">
                        <HelpCenterSearchInput />
                    </div>

                    <Breadcrumbs className="mb-4">
                        <Breadcrumbs.Item href={ROUTES.HELP_CENTER}>Help center</Breadcrumbs.Item>
                        <Breadcrumbs.Item>Search results</Breadcrumbs.Item>
                    </Breadcrumbs>

                    <h1 className="text-2xl md:text-3xl font-semibold mb-6">
                        {hasFailed ? 'Search results' : `Search results (${articles.length})`}
                    </h1>

                    {hasFailed && (
                        <Alert status="danger">
                            <Alert.Indicator />
                            <Alert.Content>
                                <Alert.Title>Search failed</Alert.Title>
                                <Alert.Description>An error occurred while searching the help center. Please try again.</Alert.Description>
                            </Alert.Content>
                        </Alert>
                    )}

                    {!hasFailed && articles.length === 0 && (
                        <Alert>
                            <Alert.Indicator />
                            <Alert.Content>
                                <Alert.Title>No articles found</Alert.Title>
                                <Alert.Description>No articles matched your search. Try different keywords.</Alert.Description>
                            </Alert.Content>
                        </Alert>
                    )}

                    {!hasFailed && articles.length > 0 && (
                        <ul className="flex flex-col gap-2 list-disc list-outside pl-5">
                            {articles.map((article) => (
                                <li key={article.id}>
                                    <Link
                                        href={reverseWithSlug(ROUTES.HELP_CENTER_ARTICLE, {
                                            id: article.id.toString(),
                                            slug: article.attributes?.title,
                                        })}
                                        className="hover:underline"
                                    >
                                        {article.attributes?.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
