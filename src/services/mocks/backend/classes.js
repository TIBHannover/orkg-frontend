import { rest } from 'msw';
import { classesUrl } from 'services/backend/classes';
import faker from 'faker';
import { DClocationResources, QBDatasetClasses } from 'services/mocks/backend/__mocks__/Classes';

const resources = [
    rest.get(classesUrl, (req, res, ctx) => {
        const query = req.url.searchParams.get('q');

        if (query === 'qb:') {
            return res(ctx.json(QBDatasetClasses));
        }
        return res(
            ctx.json({
                content: [
                    {
                        id: `C${faker.datatype.number()}`,
                        label: 'class label 1',
                        uri: null,
                        created_at: '2021-11-15T16:14:20.963023Z',
                        created_by: '00000000-0000-0000-0000-000000000000',
                        _class: 'class',
                        description: null
                    },
                    {
                        id: `C${faker.datatype.number()}`,
                        label: 'class label 2',
                        uri: null,
                        created_at: '2021-11-15T16:14:20.963205Z',
                        created_by: '00000000-0000-0000-0000-000000000000',
                        _class: 'class',
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
        );
    }),
    rest.get(`${classesUrl}:id/resources/`, (req, res, ctx) => {
        const { id } = req.params;
        const MAPPING = {
            DCLocation: DClocationResources
        };
        if (MAPPING[id]) {
            return res(ctx.json(MAPPING[id]));
        } else {
            return res(ctx.json({ root: id, statements: [] }));
        }
    })
];

export default resources;
