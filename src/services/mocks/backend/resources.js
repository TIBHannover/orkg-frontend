import { rest } from 'msw';
import { resourcesUrl } from 'services/backend/resources';
import faker from 'faker';

const resources = [
    rest.get(resourcesUrl, (req, res, ctx) =>
        res(
            ctx.json({
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
                        organization_id: '00000000-0000-0000-0000-000000000000'
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
                        organization_id: '00000000-0000-0000-0000-000000000000'
                    }
                ],
                pageable: {
                    sort: {
                        sorted: true,
                        unsorted: false,
                        empty: false
                    },
                    pageNumber: 0,
                    pageSize: 10,
                    offset: 0,
                    paged: true,
                    unpaged: false
                },
                totalPages: 1,
                totalElements: 2,
                last: true,
                first: true,
                sort: {
                    sorted: true,
                    unsorted: false,
                    empty: false
                },
                number: 0,
                numberOfElements: 2,
                size: 10,
                empty: true
            })
        )
    ),
    rest.get(`${resourcesUrl}:id`, (req, res, ctx) => {
        const { id } = req.params;

        return res(
            ctx.json({
                id,
                label: 'resource label 1',
                created_at: '2020-06-22T10:38:53.178764Z',
                classes: [],
                shared: 0,
                created_by: '00000000-0000-0000-0000-000000000000',
                _class: 'resource',
                observatory_id: '00000000-0000-0000-0000-000000000000',
                extraction_method: 'UNKNOWN',
                organization_id: '00000000-0000-0000-0000-000000000000'
            })
        );
    }),
    rest.post(resourcesUrl, (req, res, ctx) => {
        const { label } = req.body;

        return res(
            ctx.json({
                id: `R${faker.datatype.number()}`,
                label: label,
                created_at: '2020-06-22T10:38:53.178764Z',
                classes: [],
                shared: 0,
                created_by: '00000000-0000-0000-0000-000000000000',
                _class: 'resource',
                observatory_id: '00000000-0000-0000-0000-000000000000',
                extraction_method: 'UNKNOWN',
                organization_id: '00000000-0000-0000-0000-000000000000'
            })
        );
    })
];

export default resources;
