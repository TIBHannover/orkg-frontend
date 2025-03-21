import Comparison from 'app/comparison/[[...comparisonId]]/Comparison';
import Coins from 'components/Coins/Coins';
import { LICENSE_URL } from 'constants/misc';
import dayjs from 'dayjs';
import { sanitize } from 'isomorphic-dompurify';
import { Metadata } from 'next';
import { getComparison } from 'services/backend/comparisons';
import { Comparison as ComparisonType } from 'services/backend/types';

export async function generateMetadata({ params }: { params: Promise<{ comparisonId: string }> }): Promise<Metadata> {
    const { comparisonId } = await params;
    let comparison: ComparisonType | undefined;
    try {
        comparison = await getComparison(comparisonId);
    } catch (e) {
        console.error(e);
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

export default async function ComparisonPage({ params }: { params: Promise<{ comparisonId: string }> }) {
    const { comparisonId } = await params;

    const comparison = await getComparison(comparisonId);

    const jsonLd = {
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

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: sanitize(JSON.stringify(jsonLd)) }} />
            <Coins item={comparison} />
            <Comparison />
        </>
    );
}
