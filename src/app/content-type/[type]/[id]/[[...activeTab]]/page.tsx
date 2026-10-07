import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import React from 'react';

import ResourcePage from '@/app/resources/[id]/[[...activeTab]]/ResourcePage';
import ROUTES from '@/constants/routes';
import { canonicalTabPath } from '@/lib/namedRoute';
import { getResource } from '@/services/backend/resources';
import type { Resource } from '@/services/backend/types';

type ContentTypePageProps = {
    params: Promise<{ id: string; type: string; activeTab?: string[] }>;
};

export async function generateMetadata({ params }: ContentTypePageProps): Promise<Metadata> {
    const { id: rawId, type, activeTab } = await params;
    // Next.js route params are not URL-decoded, so prefixed ids like `wikidata:Q34` arrive encoded.
    // Decode once so downstream API calls and `reverse()` links use the canonical id (avoids double-encoding).
    const id = decodeURIComponent(rawId);
    let resource: Resource | null = null;

    try {
        resource = await getResource(id);
    } catch (error) {
        return notFound();
    }
    return {
        title: resource.label || `${type}`,
        alternates: {
            // Self-referencing canonical so ?history= (and other query) variants — and the default tab,
            // which renders the same page — consolidate onto the clean path.
            canonical: canonicalTabPath(ROUTES.CONTENT_TYPE, ROUTES.CONTENT_TYPE_TABS, { type, id }, activeTab, 'information'),
        },
    };
}

const ContentTypePage = async ({ params }: ContentTypePageProps) => {
    const { id: rawId, type } = await params;
    const id = decodeURIComponent(rawId);
    const resource = await getResource(id);
    if (!resource) {
        return notFound();
    }
    return <ResourcePage contentType={type} id={id} />;
};

export default ContentTypePage;
