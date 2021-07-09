import { rest } from 'msw';
import { predicatesUrl } from 'services/backend/predicates';
import faker from 'faker';

const predicates = [
    rest.get(predicatesUrl, (req, res, ctx) =>
        res(
            ctx.json({
                content: [
                    {
                        id: `P${faker.datatype.number()}`,
                        label: 'property label 1',
                        created_at: '2021-07-09T09:29:50.284483Z',
                        created_by: '00000000-0000-0000-0000-000000000000',
                        _class: 'predicate',
                        description: null
                    },
                    {
                        id: `P${faker.datatype.number()}`,
                        label: 'property label 2',
                        created_at: '2021-07-09T09:29:50.284483Z',
                        created_by: '00000000-0000-0000-0000-000000000000',
                        _class: 'predicate',
                        description: null
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
    rest.get(`${predicatesUrl}:id`, (req, res, ctx) => {
        const { id } = req.params;

        return res(
            ctx.json({
                id,
                label: id,
                created_at: '2020-06-22T10:38:53.178764Z',
                classes: [],
                shared: 0,
                created_by: '00000000-0000-0000-0000-000000000000',
                _class: 'predicate',
                observatory_id: '00000000-0000-0000-0000-000000000000',
                extraction_method: 'UNKNOWN',
                organization_id: '00000000-0000-0000-0000-000000000000'
            })
        );
    })
];

export default predicates;
