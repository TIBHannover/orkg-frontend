import dayjs from 'dayjs';
import DOMPurify from 'isomorphic-dompurify';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { unstable_serialize } from 'swr';

import ComparisonWithContext from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonWithContext';
import { loadComparison, loadComparisonContents } from '@/app/comparisons/[comparisonId]/loaders';
import Coins from '@/components/Coins/Coins';
import { MISC } from '@/constants/graphSettings';
import { LICENSE_URL } from '@/constants/misc';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { comparisonUrl } from '@/services/backend/comparisons';
import { conferenceSeriesUrl, getConferenceById } from '@/services/backend/conferences-series';
import { getObservatoryById, observatoriesUrl } from '@/services/backend/observatories';
import { getOrganization, organizationsUrl } from '@/services/backend/organizations';
import { Comparison as ComparisonType } from '@/services/backend/types';

export async function generateMetadata({ params }: { params: Promise<{ comparisonId?: string }> }): Promise<Metadata> {
    const { comparisonId } = await params;
    let comparison: ComparisonType | undefined;
    if (comparisonId) {
        try {
            comparison = await loadComparison(comparisonId);
        } catch {
            console.error(`Error getting comparison ${comparisonId}`);
        }
    }

    const title = `${comparison?.title ?? 'Unpublished'} - Comparison - ORKG`;

    return {
        title,
        description: comparison?.description,
        // Every version self-canonicalizes: published versions carry their own DOI, so pointing an
        // older one at versions.head would deindex the page that DOI resolves to.
        alternates: comparisonId ? { canonical: reverse(ROUTES.COMPARISON, { comparisonId }) } : undefined,
        openGraph: {
            title,
            type: 'article',
            description: comparison?.description,
        },
    };
}

const isRealId = (v?: string): v is string => !!v && v !== MISC.UNKNOWN_ID;

export default async function ComparisonPage({ params }: { params: Promise<{ comparisonId?: string }> }) {
    const { comparisonId } = await params;
    if (!comparisonId) {
        return notFound();
    }
    let comparison: ComparisonType;
    try {
        comparison = await loadComparison(comparisonId);
    } catch {
        return notFound();
    }

    const orgId = comparison.organizations?.[0];
    const obsId = comparison.observatories?.[0];

    const [contents, organization, conference, observatory] = await Promise.all([
        loadComparisonContents(comparisonId).catch(() => undefined),
        isRealId(orgId) ? getOrganization(orgId).catch(() => undefined) : undefined,
        isRealId(orgId) ? getConferenceById(orgId).catch(() => undefined) : undefined,
        isRealId(obsId) ? getObservatoryById(obsId).catch(() => undefined) : undefined,
    ]);

    const fallback: Record<string, unknown> = {
        [unstable_serialize([comparisonId, comparisonUrl, 'getComparison'])]: comparison,
    };
    if (contents) {
        fallback[unstable_serialize([comparisonId, comparisonUrl, 'getComparisonContents'])] = contents;
    }
    if (organization && isRealId(orgId)) {
        fallback[unstable_serialize([orgId, organizationsUrl, 'getOrganization'])] = organization;
    }
    if (conference && isRealId(orgId)) {
        fallback[unstable_serialize([orgId, conferenceSeriesUrl, 'getConferenceById'])] = conference;
    }
    if (observatory && isRealId(obsId)) {
        fallback[unstable_serialize([obsId, observatoriesUrl, 'getObservatoryById'])] = observatory;
    }

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
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(JSON.stringify(jsonLd)) }} />
            <Coins item={comparison} />
            <ComparisonWithContext id={comparisonId} isEmbedded={false} fallback={fallback} />
        </>
    );
}
