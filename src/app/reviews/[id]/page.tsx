import dayjs from 'dayjs';
import { Metadata } from 'next';

import PageClient from '@/app/reviews/[id]/pageClient';
import { LICENSE_URL } from '@/constants/misc';
import { getReview } from '@/services/backend/reviews';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    let review;
    try {
        review = await getReview(id);
    } catch (e) {
        console.error(e);
    }

    if (!review) {
        return {
            title: 'Review not found - ORKG',
        };
    }

    const version = review.versions.published.find((_version) => _version.id === review.id);

    return {
        title: `${review.title ?? ''} - Review - ORKG`,
        description: version?.changelog,
        openGraph: {
            title: `${review.title ?? ''} - Review - ORKG`,
            type: 'article',
            description: version?.changelog,
        },
    };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    let review;
    try {
        review = await getReview(id);
    } catch (e) {
        console.error(e);
    }

    if (!review) {
        return <PageClient />;
    }

    const version = review.versions.published.find((_version) => _version.id === review.id);
    const publicationDate = version ? dayjs(version.created_at).format('DD MMMM YYYY') : null;

    const ldJson = {
        mainEntity: {
            headline: `${review?.title ?? ''} - Review - ORKG`,
            description: version?.changelog,
            author: review?.authors.map((author) => ({
                name: author?.name,
                ...(author.identifiers.orcid?.[0] ? { url: `http://orcid.org/${author.identifiers.orcid?.[0]}` } : {}),
                '@type': 'Person',
            })),
            datePublished: publicationDate,
            about: review?.research_fields?.[0]?.label,
            license: LICENSE_URL,
            '@type': 'ScholarlyArticle',
        },
        '@context': 'https://schema.org',
        '@type': 'WebPage',
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }} />
            <PageClient />
        </>
    );
}
