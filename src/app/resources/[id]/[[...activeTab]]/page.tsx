import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import ResourcePage from '@/app/resources/[id]/[[...activeTab]]/ResourcePage';
import ROUTES from '@/constants/routes';
import { canonicalTabPath } from '@/lib/namedRoute';
import { getResource } from '@/services/backend/resources';
import type { Resource } from '@/services/backend/types';
import { getDedicatedLink, reverseWithSlug } from '@/utilsTyped';

type Props = {
    params: Promise<{ id: string; activeTab?: string[] }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const { id: rawId, activeTab } = await params;
    // Next.js route params are not URL-decoded, so prefixed ids like `wikidata:Q34` arrive encoded.
    // Decode once so downstream API calls and `reverse()` links use the canonical id (avoids double-encoding).
    const id = decodeURIComponent(rawId);
    const { noRedirect } = await searchParams;
    let resource: Resource | null = null;
    try {
        resource = await getResource(id);
    } catch (error) {
        return notFound();
    }
    const link = getDedicatedLink(resource.classes);
    if (noRedirect === undefined && link) {
        return redirect(
            reverseWithSlug(link.route, {
                ...(link.getParams
                    ? link.getParams(resource)
                    : { [link.routeParams!]: resource.id, slug: link.hasSlug ? resource.label : undefined }),
                slug: link.hasSlug ? resource.label : undefined,
            }),
        );
    }
    return {
        title: resource.label || 'Resource',
        alternates: {
            // Self-referencing canonical so ?history= (and other query) variants — and the default tab,
            // which renders the same page — consolidate onto the clean path. `id` is decoded above;
            // reverse() re-encodes it, matching the app's own links for prefixed ids like `wikidata:Q34`.
            canonical: canonicalTabPath(ROUTES.RESOURCE, ROUTES.RESOURCE_TABS, { id }, activeTab, 'information'),
        },
    };
}

const ResourceRoute = async ({ params }: Props) => {
    const { id: rawId } = await params;
    const id = decodeURIComponent(rawId);
    const resource = await getResource(id);
    if (!resource) {
        return notFound();
    }
    return <ResourcePage contentType="Resource" id={id} />;
};

export default ResourceRoute;
