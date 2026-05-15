import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import ResourcePage from '@/app/resources/[id]/[[...activeTab]]/ResourcePage';
import { getResource } from '@/services/backend/resources';
import type { Resource } from '@/services/backend/types';
import { getDedicatedLink, reverseWithSlug } from '@/utilsTyped';

type Props = {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const { id } = await params;
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
    };
}

const ResourceRoute = async ({ params }: Props) => {
    const { id } = await params;
    const resource = await getResource(id);
    if (!resource) {
        return notFound();
    }
    return <ResourcePage contentType="Resource" id={id} />;
};

export default ResourceRoute;
