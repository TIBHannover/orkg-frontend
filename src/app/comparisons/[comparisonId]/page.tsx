import dayjs from 'dayjs';
import DOMPurify from 'isomorphic-dompurify';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import Comparison from '@/app/comparisons/[comparisonId]/Comparison';
import Coins from '@/components/Coins/Coins';
import { LICENSE_URL } from '@/constants/misc';
import { getComparison } from '@/services/backend/comparisons';
import { Comparison as ComparisonType } from '@/services/backend/types';

export async function generateMetadata({ params }: { params: Promise<{ comparisonId?: string }> }): Promise<Metadata> {
    const { comparisonId } = await params;
    let comparison: ComparisonType | undefined;
    if (comparisonId) {
        try {
            comparison = await getComparison(comparisonId);
        } catch (e) {
            console.error(`Error getting comparison ${comparisonId}`);
        }
    }

    const title = `${comparison?.title ?? 'Unpublished'} - Comparison - ORKG`;

    return {
        title,
        description: comparison?.description,
        openGraph: {
            title,
            type: 'article',
            description: comparison?.description,
        },
    };
}

export default async function ComparisonPage({ params }: { params: Promise<{ comparisonId?: string }> }) {
    const { comparisonId } = await params;
    let comparison: ComparisonType | undefined;
    let jsonLd: Record<string, unknown> | undefined;

    if (comparisonId) {
        try {
            comparison = await getComparison(comparisonId);
        } catch {
            return notFound();
        }
        jsonLd = {
            mainEntity: {
                headline: comparison.title,
                description: comparison.description,
                ...(comparison.identifiers?.doi?.[0] ? { sameAs: `https://doi.org/${comparison.identifiers?.doi?.[0]}` } : {}),
                author: comparison.authors?.map((author) => ({
                    name: author.name,
                    ...(author.identifiers?.orcid?.[0] ? { url: `http://orcid.org/${author.identifiers.orcid?.[0]}` } : {}),
                    '@type': 'Person',
                })),
                datePublished: comparison.created_at ? dayjs(comparison.created_at).format('DD MMMM YYYY') : '',
                about: comparison.research_fields?.[0]?.label,
                license: LICENSE_URL,
                '@type': 'ScholarlyArticle',
            },
            '@context': 'https://schema.org',
            '@type': 'WebPage',
        };
    }

    return (
        <>
            {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(JSON.stringify(jsonLd)) }} />}
            {comparison && <Coins item={comparison} />}
            <Comparison />
        </>
    );
}
