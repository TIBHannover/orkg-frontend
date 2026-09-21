import { http, HttpResponse } from 'msw';

import { contentTypesUrl } from '@/services/backend/contentTypes';
import { createMSWComparison } from '@/services/mocks/backend/comparisons';
import { createMSWLiteratureList } from '@/services/mocks/backend/literatureLists';
import { createMSWReview } from '@/services/mocks/backend/reviews';
import { createMSWVisualization } from '@/services/mocks/backend/visualizations';

const base = contentTypesUrl.replace(/\/+$/, '');

// one item per _class the endpoint can deliver (papers use the same wire shape as the papers mock)
export const createMSWContentTypesPage = () => ({
    content: [
        {
            id: 'R11',
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
            versions: { head: { id: 'R11', label: 'Paper title', created_at: '2020-06-03T20:21:11.980177+02:00' }, published: [] },
            verified: false,
            visibility: 'DEFAULT',
            unlisted_by: null,
            sdgs: [],
            mentionings: [],
            _class: 'paper',
        },
        createMSWComparison('R21'),
        createMSWVisualization('R31'),
        createMSWLiteratureList('R41'),
        createMSWReview('R51'),
    ],
    page: { number: 0, size: 25, total_elements: 5, total_pages: 1 },
});

const contentTypes = [
    http.get(base, () => HttpResponse.json(createMSWContentTypesPage())),
    http.get(`${base}/`, () => HttpResponse.json(createMSWContentTypesPage())),
];

export default contentTypes;
