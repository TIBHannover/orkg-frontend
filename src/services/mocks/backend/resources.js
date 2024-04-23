import { faker } from '@faker-js/faker';
import { http, HttpResponse } from 'msw';
import { resourcesUrl } from 'services/backend/resources';
import DClocationResources from 'services/mocks/backend/__mocks__/Resources';

const resources = [
    http.get(resourcesUrl, ({ request }) => {
        // const include = req.url.searchParams.get('include');
        const url = new URL(request.url);
        const include = url.searchParams.get('include');
        const MAPPING = {
            DCLocation: DClocationResources,
        };
        if (MAPPING[include]) {
            return HttpResponse.json(MAPPING[include]);
        }

        return HttpResponse.json({
            content: [
                {
                    id: `R${faker.datatype.number()}`,
                    label: 'resource label 1',
                    created_at: '2020-06-22T10:38:53.178764Z',
                    classes: [],
                    shared: 0,
                    created_by: '00000000-0000-0000-0000-000000000000',
                    _class: 'resource',
                    observatory_id: '00000000-0000-0000-0000-000000000000',
                    extraction_method: 'UNKNOWN',
                    organization_id: '00000000-0000-0000-0000-000000000000',
                },
                {
                    id: `R${faker.datatype.number()}`,
                    label: 'resource label 1',
                    created_at: '2020-06-25T11:29:07.197842Z',
                    classes: [],
                    shared: 0,
                    created_by: '00000000-0000-0000-0000-000000000000',
                    _class: 'resource',
                    observatory_id: '00000000-0000-0000-0000-000000000000',
                    extraction_method: 'UNKNOWN',
                    organization_id: '00000000-0000-0000-0000-000000000000',
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
    http.get(`${resourcesUrl}:id`, ({ params }) => {
        const { id } = params;
        const MAPPING = {
            R144080: {
                id: 'R144080',
                label: 'Test Resource R0',
                created_at: '2021-11-15T11:20:41.326694Z',
                classes: ['C4000'],
                shared: 0,
                created_by: '40f2034c-986b-451f-ac08-67b1bd23fe3d',
                _class: 'resource',
                observatory_id: '00000000-0000-0000-0000-000000000000',
                extraction_method: 'UNKNOWN',
                organization_id: '00000000-0000-0000-0000-000000000000',
            },
        };
        if (MAPPING[id]) {
            return HttpResponse.json(MAPPING[id]);
        }
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
    }),
    http.post(resourcesUrl, async ({ request }) => {
        const { label, classes } = await request.json();

        return HttpResponse.json({
            id: `R${faker.datatype.number()}`,
            label,
            created_at: '2020-06-22T10:38:53.178764Z',
            classes: classes ?? [],
            shared: 0,
            created_by: '00000000-0000-0000-0000-000000000000',
            _class: 'resource',
            observatory_id: '00000000-0000-0000-0000-000000000000',
            extraction_method: 'UNKNOWN',
            organization_id: '00000000-0000-0000-0000-000000000000',
        });
    }),
    http.put(`${resourcesUrl}:id`, async ({ request, params }) => {
        const { label, classes } = await request.json();
        const { id } = params;
        return HttpResponse.json({
            id,
            label,
            created_at: '2020-06-22T10:38:53.178764Z',
            classes: classes ?? [],
            shared: 0,
            created_by: '00000000-0000-0000-0000-000000000000',
            _class: 'resource',
            observatory_id: '00000000-0000-0000-0000-000000000000',
            extraction_method: 'UNKNOWN',
            organization_id: '00000000-0000-0000-0000-000000000000',
        });
    }),
];

export default resources;
