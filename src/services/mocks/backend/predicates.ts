import { http, HttpResponse } from 'msw';
import { predicatesUrl } from 'services/backend/predicates';
import db from 'services/mocks/db';
import { createMSWPredicate } from 'services/mocks/helpers';

const predicates = [
    http.get(predicatesUrl, ({ request }: { request: Request }) => {
        const allPredicates = db.predicates.getAll();
        const url = new URL(request.url);
        const page = Number(url.searchParams.get('page')) ?? 0;
        const size = Number(url.searchParams.get('size')) ?? 9999;

        const currentPredicates = db.predicates.findMany({
            take: size ? Number(size) : undefined,
            skip: page ? Number(page) * 10 : undefined,
        });

        return HttpResponse.json({
            content: currentPredicates,
            pageable: {
                sort: { sorted: true, unsorted: false, empty: false },
                pageNumber: 0,
                pageSize: size,
                offset: 0,
                paged: true,
                unpaged: false,
            },
            totalPages: Math.ceil(allPredicates.length / size),
            totalElements: allPredicates,
            last: page + 1 >= Math.ceil(allPredicates.length / size),
            first: page === 0,
            sort: { sorted: true, unsorted: false, empty: false },
            size,
            number: 0,
            numberOfElements: currentPredicates.length,
            empty: false,
        });
    }),
    http.get(`${predicatesUrl}:id`, ({ params }: { params: { id: string } }) => {
        const { id } = params;
        const predicate = db.predicates.findFirst({
            where: {
                id: {
                    equals: id,
                },
            },
        });
        if (!predicate) {
            return HttpResponse.json({
                id,
                label: 'property label 1',
                created_at: '2020-06-22T10:38:53.178764Z',
                classes: [],
                shared: 0,
                created_by: '00000000-0000-0000-0000-000000000000',
                _class: 'predicate',
                observatory_id: '00000000-0000-0000-0000-000000000000',
                extraction_method: 'UNKNOWN',
                organization_id: '00000000-0000-0000-0000-000000000000',
            });
        }
        return HttpResponse.json(predicate);
    }),
    http.post(`${predicatesUrl}`, async ({ request }: { request: Request }) => {
        const { label } = await request.json();
        const newPredicate = createMSWPredicate({
            label,
        });
        return HttpResponse.json(newPredicate);
    }),
];

export default predicates;
