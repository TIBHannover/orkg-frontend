import { http, HttpResponse } from 'msw';

import { comparisonUrl } from '@/services/backend/comparisons';

// the generated client deserializes responses, so handlers must answer with the wire format (snake_case)
export const createMSWComparison = (id: string) => ({
    id,
    title: 'Comparison title',
    description: 'Comparison description',
    research_fields: [{ id: 'R12', label: 'Computer Sciences' }],
    identifiers: { doi: [] },
    publication_info: { published_month: null, published_year: null, published_in: null, url: null },
    authors: [],
    sdgs: [],
    contributions: [],
    visualizations: [],
    related_figures: [],
    related_resources: [],
    references: [],
    observatories: [],
    organizations: [],
    extraction_method: 'UNKNOWN',
    created_at: '2020-06-03T20:21:11.980177+02:00',
    created_by: '1ce9b643-32aa-439a-8237-058342cc2b6a',
    versions: {
        head: {
            id,
            label: 'Comparison title',
            created_at: '2020-06-03T20:21:11.980177+02:00',
            created_by: '1ce9b643-32aa-439a-8237-058342cc2b6a',
        },
        published: [],
    },
    is_anonymized: false,
    visibility: 'DEFAULT',
    published: false,
    unlisted_by: null,
    sources: [{ id: 'R100', type: 'THING' }],
    search_protocol: { research_questions: [], search_strings: [], search_engines: [] },
    type: 'UNKNOWN',
    _class: 'comparison',
});

export const createMSWComparisonContents = () => ({
    selected_paths: [
        {
            id: 'P32',
            label: 'research problem',
            type: 'PREDICATE',
            children: [],
        },
    ],
    titles: [],
    subtitles: [],
    values: {},
});

const base = comparisonUrl.replace(/\/+$/, '');

const paginated = (content: unknown[]) => ({
    content,
    page: { number: 0, size: 25, total_elements: content.length, total_pages: 1 },
});

const comparisons = [
    http.get(base, () => HttpResponse.json(paginated([createMSWComparison('R1')]))),
    http.get(`${base}/`, () => HttpResponse.json(paginated([createMSWComparison('R1')]))),
    http.get(`${base}/:id/contents`, () => HttpResponse.json(createMSWComparisonContents())),
    http.get(`${base}/:id/table-paths`, () => HttpResponse.json([])),
    http.get(`${base}/:id/authors`, () => HttpResponse.json(paginated([]))),
    http.get(`${base}/:id/related-figures/:figureId`, ({ params }) =>
        HttpResponse.json({
            id: params.figureId,
            label: 'Related figure',
            image: '',
            description: '',
            created_at: '2020-06-03T20:21:11.980177+02:00',
            created_by: '1ce9b643-32aa-439a-8237-058342cc2b6a',
        }),
    ),
    http.get(`${base}/:id/related-resources/:resourceId`, ({ params }) =>
        HttpResponse.json({
            id: params.resourceId,
            label: 'Related resource',
            url: '',
            image: '',
            description: '',
            created_at: '2020-06-03T20:21:11.980177+02:00',
            created_by: '1ce9b643-32aa-439a-8237-058342cc2b6a',
        }),
    ),
    http.get(`${base}/:id`, ({ params }) => HttpResponse.json(createMSWComparison(params.id as string))),
];

export default comparisons;
