import { http, HttpResponse } from 'msw';

import { classesUrl } from '@/services/backend/classes';
import db from '@/services/mocks/db';
import { createMSWClass } from '@/services/mocks/helpers';

const resources = [
    http.get(classesUrl, ({ request }) => {
        const url = new URL(request.url);
        const query = url.searchParams.get('q');
        const page = Number(url.searchParams.get('page')) ?? 0;
        const size = Number(url.searchParams.get('size')) ?? 9999;
        const allClasses = db.classes.getAll();
        const currentClasses = db.classes.findMany({
            ...(query
                ? {
                      where: {
                          label: {
                              contains: query,
                          },
                      },
                  }
                : {}),
            take: size ? Number(size) : undefined,
            skip: page ? Number(page) * 10 : undefined,
        });
        return HttpResponse.json({
            content: currentClasses,
            page: {
                number: page,
                size,
                total_elements: allClasses.length,
                total_pages: Math.ceil(allClasses.length / size),
            },
        });
    }),
    http.get(`${classesUrl}/:id`, ({ params }) => {
        const { id } = params as { id: string };
        const classItem = db.classes.findFirst({
            where: {
                id: {
                    equals: id,
                },
            },
        });
        if (!classItem) {
            return HttpResponse.json({
                id: `C${id}`,
                label: 'Class label',
                uri: null,
                created_at: '2020-06-03T20:21:11.980177+02:00',
                created_by: '1ce9b643-32aa-439a-8237-058342cc2b6a',
                _class: 'class',
                description: null,
            });
        }
        return HttpResponse.json(classItem);
    }),
    http.post(classesUrl, async ({ request }: { request: Request }) => {
        const { label, uri } = await request.json();
        const newClass = createMSWClass({
            label,
            uri,
        });
        return new HttpResponse(null, {
            headers: {
                Location: `${classesUrl}/${newClass.id}`,
            },
        });
    }),
];

export default resources;
