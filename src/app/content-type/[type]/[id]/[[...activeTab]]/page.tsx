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
    const { id, type } = await params;
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
    const { id, type } = await params;
    const resource = await getResource(id);
    if (!resource) {
        return notFound();
    }
    return <ResourcePage contentType={type} id={id} />;
};

export default ContentTypePage;
