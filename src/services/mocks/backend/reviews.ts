import { http, HttpResponse } from 'msw';

import { reviewUrl } from '@/services/backend/reviews';

// the generated client deserializes responses, so handlers must answer with the wire format (snake_case)
export const createMSWReview = (id: string) => ({
    id,
    title: 'Review title',
    research_fields: [{ id: 'R12', label: 'Computer Sciences' }],
    authors: [],
    versions: {
        head: {
            id,
            label: 'Review title',
            created_at: '2020-06-03T20:21:11.980177+02:00',
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
            classes: ['C27'],
            text: 'Section text',
        },
        {
            id: `${id}_S2`,
            type: 'comparison',
            heading: 'Comparison section',
            comparison: { id: 'R200', label: 'A comparison', classes: ['Comparison'], _class: 'resource_ref' },
        },
    ],
    references: [],
    acknowledgements: {},
    _class: 'smart-review',
});

const base = reviewUrl.replace(/\/+$/, '');

const paginated = (content: unknown[]) => ({
    content,
    page: { number: 0, size: 25, total_elements: content.length, total_pages: 1 },
});

const reviews = [
    http.get(base, () => HttpResponse.json(paginated([createMSWReview('R1')]))),
    http.get(`${base}/`, () => HttpResponse.json(paginated([createMSWReview('R1')]))),
    http.get(`${base}/:id/published-contents/:contentId`, () =>
        HttpResponse.json({
            _class: 'statement_list',
            statements: [],
        }),
    ),
    http.get(`${base}/:id`, ({ params }) => HttpResponse.json(createMSWReview(params.id as string))),
];

export default reviews;
