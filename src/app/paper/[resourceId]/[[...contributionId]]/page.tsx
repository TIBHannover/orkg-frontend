import Coins from 'components/Coins/Coins';
import ViewPaper from 'components/ViewPaper/Page/ViewPaper';

import ViewPaperVersion from 'components/ViewPaper/Page/ViewPaperVersion';
import { CLASSES } from 'constants/graphSettings';
import { LICENSE_URL } from 'constants/misc';
import dayjs from 'dayjs';
import { sanitize } from 'isomorphic-dompurify';
import { Metadata } from 'next';
import { getPaper } from 'services/backend/papers';
import { getResource } from 'services/backend/resources';
import { Paper } from 'services/backend/types';

const getDescription = (paper?: Paper) =>
    `ORKG structured paper description. Published: ${
        paper?.publication_info?.published_month ? dayjs(paper.publication_info?.published_month, 'M').format('MMMM') : ''
    } ${paper?.publication_info?.published_year ? paper.publication_info?.published_year : ''} • Research field: ${
        paper?.research_fields?.[0]?.label
    } • Authors: ${paper?.authors?.map((author) => author.name).join(', ')}`;

export async function generateMetadata({ params }: { params: Promise<{ resourceId: string }> }): Promise<Metadata> {
    const { resourceId } = await params;
    let paper: Paper | undefined;
    try {
        paper = await getPaper(resourceId);
    } catch (e) {
        console.error(e);
    }
    const title = `${paper?.title ?? 'Paper'} - ORKG`;
    const description = getDescription(paper);

    return {
        title,
        description,
        openGraph: {
            title,
            type: 'article',
            description,
        },
    };
}

/**
 * This component checks if the paper if a published version or live version and return the correct page
 */
export default async function CheckPaperVersion(props: { params: Promise<{ resourceId: string }> }) {
    const params = await props.params;

    const paperResource = await getResource(params.resourceId);
    const paperType = paperResource.classes.find((c) => c === CLASSES.PAPER || c === CLASSES.PAPER_VERSION);

    if (paperType === CLASSES.PAPER_VERSION) {
        return <ViewPaperVersion />;
    }
    const paper = await getPaper(paperResource.id);

    const jsonLd = {
        mainEntity: {
            headline: paper.title,
            description: getDescription(paper),
            ...(paper?.identifiers?.doi?.[0] ? { sameAs: `https://doi.org/${paper?.identifiers?.doi?.[0]}` } : {}),
            author: paper?.authors?.map((author) => ({
                name: author.name,
                ...(author?.identifiers?.orcid?.[0] ? { url: `http://orcid.org/${author?.identifiers?.orcid?.[0]}` } : {}),
                '@type': 'Person',
            })),
            datePublished: `${paper.publication_info?.published_month ? dayjs(paper.publication_info?.published_month, 'M').format('MMMM') : ''} ${
                paper.publication_info?.published_year ? paper.publication_info?.published_year : ''
            }`,
            about: paper?.research_fields?.[0]?.label,
            license: LICENSE_URL,
            '@type': 'ScholarlyArticle',
        },
        '@context': 'https://schema.org',
        '@type': 'WebPage',
    };

    return (
        <>
            <Coins item={paper} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: sanitize(JSON.stringify(jsonLd)) }} />
            <ViewPaper />
        </>
    );
}
