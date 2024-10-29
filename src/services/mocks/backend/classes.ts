import { http, HttpResponse } from 'msw';
import { classesUrl } from 'services/backend/classes';
import db from 'services/mocks/db';
import { createMSWClass } from 'services/mocks/helpers';

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
            pageable: {
                sort: { sorted: true, unsorted: false, empty: false },
                pageNumber: 0,
                pageSize: size,
                offset: 0,
                paged: true,
                unpaged: false,
            },
            totalPages: Math.ceil(allClasses.length / size),
            totalElements: allClasses,
            last: page + 1 >= Math.ceil(allClasses.length / size),
            first: page === 0,
            sort: { sorted: true, unsorted: false, empty: false },
            size,
            number: 0,
            numberOfElements: allClasses.length,
            empty: false,
        });
    }),
    http.get(`${classesUrl}:id`, ({ params }) => {
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
        return HttpResponse.json(newClass);
    }),
];

export default resources;
