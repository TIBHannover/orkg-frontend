import { http, HttpResponse } from 'msw';
import { predicatesUrl } from 'services/backend/predicates';
import { faker } from '@faker-js/faker';

const predicates = [
    http.get(predicatesUrl, () =>
        HttpResponse.json({
            content: [
                {
                    id: `P${faker.datatype.number()}`,
                    label: 'property label 1',
                    created_at: '2021-07-09T09:29:50.284483Z',
                    created_by: '00000000-0000-0000-0000-000000000000',
                    _class: 'predicate',
                    description: null,
                },
                {
                    id: `P${faker.datatype.number()}`,
                    label: 'property label 2',
                    created_at: '2021-07-09T09:29:50.284483Z',
                    created_by: '00000000-0000-0000-0000-000000000000',
                    _class: 'predicate',
                    description: null,
                },
                {
                    id: 'P1',
                    label: 'property 1',
                    created_at: '2021-07-09T09:29:50.284483Z',
                    created_by: '00000000-0000-0000-0000-000000000000',
                    _class: 'predicate',
                    description: null,
                },
            ],
            pageable: {
                sort: {
                    sorted: true,
                    unsorted: false,
                    empty: false,
                },
                pageNumber: 0,
                pageSize: 10,
                offset: 0,
                paged: true,
                unpaged: false,
            },
            totalPages: 1,
            totalElements: 2,
            last: true,
            first: true,
            sort: {
                sorted: true,
                unsorted: false,
                empty: false,
            },
            number: 0,
            numberOfElements: 2,
            size: 10,
            empty: true,
        }),
    ),
    http.get(`${predicatesUrl}:id`, ({ params }) => {
        const { id } = params;

        return HttpResponse.json({
            id,
            label: id,
            created_at: '2020-06-22T10:38:53.178764Z',
            classes: [],
            shared: 0,
            created_by: '00000000-0000-0000-0000-000000000000',
            _class: 'predicate',
            observatory_id: '00000000-0000-0000-0000-000000000000',
            extraction_method: 'UNKNOWN',
            organization_id: '00000000-0000-0000-0000-000000000000',
        });
    }),
    http.post(`${predicatesUrl}`, async ({ request }) => {
        const { label } = await request.json();
        return HttpResponse.json({
            id: `P${faker.datatype.number()}`,
            label,
            created_at: '2021-11-10T15:12:12.33781Z',
            created_by: '40f2034c-986b-451f-ac08-67b1bd23fe3d',
            _class: 'predicate',
            description: null,
        });
    }),
];

export default predicates;
