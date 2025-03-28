import { http, HttpResponse } from 'msw';

import { resourcesUrl } from '@/services/backend/resources';
import db from '@/services/mocks/db';
import { createMSWResource } from '@/services/mocks/helpers';

const resources = [
    http.get(resourcesUrl, ({ request }) => {
        const url = new URL(request.url);
        const include = url.searchParams.get('include');
        const page = Number(url.searchParams.get('page')) ?? 0;
        const size = Number(url.searchParams.get('size')) ?? 9999;
        const allResources = db.resources.getAll();
        const currentResources = db.resources.findMany({
            ...(include
                ? {
                      where: {
                          classes: {
                              contains: include,
                          },
                      },
                  }
                : {}),
            take: size ? Number(size) : undefined,
            skip: page ? Number(page) * 10 : undefined,
        });

        return HttpResponse.json({
            content: currentResources.map((resource) => ({
                ...resource,
                classes: resource.classes.split(',').filter((c) => c !== ''),
            })),
            page: {
                total_pages: Math.ceil(allResources.length / size),
                total_elements: allResources,
                size,
                number: page,
            },
        });
    }),
    http.get(`${resourcesUrl}:id`, ({ params }) => {
        const { id } = params as { id: string };
        const resource = db.resources.findFirst({
            where: {
                id: {
                    equals: id,
                },
            },
        });
        if (!resource) {
            return HttpResponse.json({
                id,
                label: 'resource label 1',
                created_at: '2020-06-22T10:38:53.178764Z',
                classes: [],
                shared: 0,
                created_by: '00000000-0000-0000-0000-000000000000',
                _class: 'resource',
                observatory_id: '00000000-0000-0000-0000-000000000000',
                extraction_method: 'UNKNOWN',
                organization_id: '00000000-0000-0000-0000-000000000000',
            });
        }
        return HttpResponse.json({ ...resource, classes: resource.classes.split(',').filter((c) => c !== '') });
    }),
    http.post(resourcesUrl, async ({ request }: { request: Request }) => {
        const { label, classes } = await request.json();
        const newResource = createMSWResource({
            label,
            classes,
        });
        return HttpResponse.json({ ...newResource, classes: newResource.classes.split(',').filter((c) => c !== '') ?? [] });
    }),
    http.put(`${resourcesUrl}:id`, async ({ request, params }: { request: Request; params: { id?: string } }) => {
        const { label, classes } = await request.json();
        const { id } = params;
        const updatedResource = db.resources.update({
            where: {
                id: {
                    equals: id,
                },
            },
            data: {
                label,
                classes: classes.join(','),
            },
        });
        return HttpResponse.json({ ...updatedResource, classes: updatedResource?.classes?.split(',').filter((c) => c !== '') ?? [] });
    }),
];

export default resources;
