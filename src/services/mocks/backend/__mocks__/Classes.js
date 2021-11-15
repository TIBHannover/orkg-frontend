import faker from 'faker';

export const DClocationResources = {
    content: [
        {
            id: `R${faker.datatype.number()}`,
            label: 'Hannover',
            created_at: '2020-06-18T12:37:02.422347Z',
            classes: ['DCLocation'],
            shared: 2,
            created_by: '00000000-0000-0000-0000-000000000000',
            _class: 'resource',
            observatory_id: '00000000-0000-0000-0000-000000000000',
            extraction_method: 'UNKNOWN',
            organization_id: '00000000-0000-0000-0000-000000000000'
        },
        {
            id: `R${faker.datatype.number()}`,
            label: 'Annaba',
            created_at: '2020-06-18T12:37:02.422347Z',
            classes: ['DCLocation'],
            shared: 2,
            created_by: '00000000-0000-0000-0000-000000000000',
            _class: 'resource',
            observatory_id: '00000000-0000-0000-0000-000000000000',
            extraction_method: 'UNKNOWN',
            organization_id: '00000000-0000-0000-0000-000000000000'
        }
    ],
    pageable: { sort: { sorted: true, unsorted: false, empty: false }, pageNumber: 0, pageSize: 10, offset: 0, paged: true, unpaged: false },
    totalPages: 1,
    totalElements: 2,
    last: true,
    first: true,
    sort: { sorted: true, unsorted: false, empty: false },
    size: 10,
    number: 0,
    numberOfElements: 2,
    empty: false
};
