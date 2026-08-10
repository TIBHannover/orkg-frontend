import { http, HttpResponse } from 'msw';

import { papersUrl } from '@/services/backend/papers';

// the generated client deserializes responses, so handlers must answer with the wire format (snake_case)
const createMSWPaper = (id: string) => ({
    id,
    title: 'Paper title',
    research_fields: [{ id: 'R12', label: 'Computer Sciences' }],
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
    versions: {
        head: {
            id,
            label: 'Paper title',
            created_at: '2020-06-03T20:21:11.980177+02:00',
            created_by: '1ce9b643-32aa-439a-8237-058342cc2b6a',
        },
        published: [],
    },
    verified: false,
    visibility: 'DEFAULT',
    modifiable: true,
    unlisted_by: null,
    sdgs: [],
    mentionings: [],
    _class: 'paper',
});

const papers = [
    http.get(papersUrl, ({ request }) => {
        const url = new URL(request.url);
        const page = Number(url.searchParams.get('page')) || 0;
        const size = Number(url.searchParams.get('size')) || 9999;
        return HttpResponse.json({
            content: [],
            page: {
                number: page,
                size,
                total_elements: 0,
                total_pages: 0,
            },
        });
    }),
    http.get(`${papersUrl}/:id`, ({ params }) => {
        const { id } = params as { id: string };
        return HttpResponse.json(createMSWPaper(id));
    }),
];

export default papers;
