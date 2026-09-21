import { http, HttpResponse } from 'msw';

import { literatureListsUrl } from '@/services/backend/literatureLists';

// the generated client deserializes responses, so handlers must answer with the wire format (snake_case)
export const createMSWLiteratureList = (id: string) => ({
    id,
    title: 'Literature list title',
    research_fields: [{ id: 'R12', label: 'Computer Sciences' }],
    authors: [],
    versions: {
        head: {
            id,
            label: 'Literature list title',
            created_at: '2020-06-03T20:21:11.980177+02:00',
            created_by: '1ce9b643-32aa-439a-8237-058342cc2b6a',
        },
        published: [],
    },
    sdgs: [],
    observatories: [],
    organizations: [],
    extraction_method: 'UNKNOWN',
    created_at: '2020-06-03T20:21:11.980177+02:00',
    created_by: '1ce9b643-32aa-439a-8237-058342cc2b6a',
    visibility: 'DEFAULT',
    published: false,
    unlisted_by: null,
    identifiers: { doi: [] },
    sections: [
        {
            id: `${id}_S1`,
            type: 'text',
            heading: 'Introduction',
            heading_size: 2,
            text: 'Section text',
        },
        {
            id: `${id}_S2`,
            type: 'list',
            entries: [],
        },
    ],
    acknowledgements: {},
    _class: 'literature-list',
});

const base = literatureListsUrl.replace(/\/+$/, '');

const paginated = (content: unknown[]) => ({
    content,
    page: { number: 0, size: 25, total_elements: content.length, total_pages: 1 },
});

const literatureLists = [
    http.get(base, () => HttpResponse.json(paginated([createMSWLiteratureList('R1')]))),
    http.get(`${base}/`, () => HttpResponse.json(paginated([createMSWLiteratureList('R1')]))),
    http.get(`${base}/:id/published-contents/:contentId`, ({ params }) =>
        HttpResponse.json({
            id: params.contentId,
            title: 'Paper title',
            research_fields: [],
            identifiers: { doi: [] },
            publication_info: { published_month: null, published_year: null, published_in: null, url: null },
            authors: [],
            contributions: [],
            organizations: [],
            observatories: [],
            extraction_method: 'UNKNOWN',
            created_at: '2020-06-03T20:21:11.980177+02:00',
            created_by: '1ce9b643-32aa-439a-8237-058342cc2b6a',
            published: false,
            versions: { head: { id: params.contentId, label: 'Paper title', created_at: '2020-06-03T20:21:11.980177+02:00' }, published: [] },
            verified: false,
            visibility: 'DEFAULT',
            unlisted_by: null,
            sdgs: [],
            mentionings: [],
            _class: 'paper',
        }),
    ),
    http.get(`${base}/:id`, ({ params }) => HttpResponse.json(createMSWLiteratureList(params.id as string))),
];

export default literatureLists;
