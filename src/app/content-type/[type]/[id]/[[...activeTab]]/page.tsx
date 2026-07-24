import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import React from 'react';

import ResourcePage from '@/app/resources/[id]/[[...activeTab]]/ResourcePage';
import { getResource } from '@/services/backend/resources';
import type { Resource } from '@/services/backend/types';

type ContentTypePageProps = {
    params: Promise<{ id: string; type: string }>;
};

export async function generateMetadata({ params }: ContentTypePageProps): Promise<Metadata> {
    const { id: rawId, type } = await params;
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
