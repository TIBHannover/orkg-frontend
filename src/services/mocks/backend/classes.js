import { faker } from '@faker-js/faker';
import { http, HttpResponse } from 'msw';
import { classesUrl } from 'services/backend/classes';
import QBDatasetClasses from 'services/mocks/backend/__mocks__/Classes';

const resources = [
    http.get(classesUrl, ({ request }) => {
        const url = new URL(request.url);
        const query = url.searchParams.get('q');
        if (query === 'qb:') {
            return HttpResponse.json(QBDatasetClasses);
        }
        if (query === 'R40006') {
            return HttpResponse.json({
                content: [
                    {
                        id: 'C4000',
                        label: 'R40006',
                        uri: null,
                        created_at: '2021-11-15T16:14:20.963023Z',
                        created_by: '00000000-0000-0000-0000-000000000000',
                        _class: 'class',
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
                totalElements: 1,
                last: true,
                first: true,
                sort: {
                    sorted: true,
                    unsorted: false,
                    empty: false,
                },
                number: 0,
                numberOfElements: 1,
                size: 10,
                empty: true,
            });
        }
        return HttpResponse.json({
            content: [
                {
                    id: `C${faker.datatype.number()}`,
                    label: 'class label 1',
                    uri: null,
                    created_at: '2021-11-15T16:14:20.963023Z',
                    created_by: '00000000-0000-0000-0000-000000000000',
                    _class: 'class',
                    description: null,
                },
                {
                    id: `C${faker.datatype.number()}`,
                    label: 'class label 2',
                    uri: null,
                    created_at: '2021-11-15T16:14:20.963205Z',
                    created_by: '00000000-0000-0000-0000-000000000000',
                    _class: 'class',
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
        });
    }),
    http.get(`${classesUrl}:id`, ({ params }) => {
        const { id } = params;

        return HttpResponse.json({
            id: `C${id}`,
            label: 'Class label',
            uri: null,
            created_at: '2020-06-03T20:21:11.980177+02:00',
            created_by: '1ce9b643-32aa-439a-8237-058342cc2b6a',
            _class: 'class',
            description: null,
        });
    }),
    http.post(classesUrl, async ({ request }) => {
        const { label, uri } = await request.json();

        return HttpResponse.json({
            id: `C${faker.datatype.number()}`,
            label,
            uri,
            description: null,
            _class: 'class',
            created_at: '2020-06-22T10:38:53.178764Z',
            created_by: '00000000-0000-0000-0000-000000000000',
        });
    }),
];

export default resources;
