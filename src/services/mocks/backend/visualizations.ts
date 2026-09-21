import { http, HttpResponse } from 'msw';

import { visualizationsUrl } from '@/services/backend/visualizations';

// the generated client deserializes responses, so handlers must answer with the wire format (snake_case)
export const createMSWVisualization = (id: string) => ({
    id,
    title: 'Visualization title',
    description: 'Visualization description',
    authors: [],
    observatories: [],
    organizations: [],
    extraction_method: 'UNKNOWN',
    created_at: '2020-06-03T20:21:11.980177+02:00',
    created_by: '1ce9b643-32aa-439a-8237-058342cc2b6a',
    visibility: 'DEFAULT',
    unlisted_by: null,
    _class: 'visualization',
});

const base = visualizationsUrl.replace(/\/+$/, '');

const paginated = (content: unknown[]) => ({
    content,
    page: { number: 0, size: 25, total_elements: content.length, total_pages: 1 },
});

const visualizations = [
    http.get(base, () => HttpResponse.json(paginated([createMSWVisualization('R1')]))),
    http.get(`${base}/`, () => HttpResponse.json(paginated([createMSWVisualization('R1')]))),
    http.get(`${base}/:id`, ({ params }) => HttpResponse.json(createMSWVisualization(params.id as string))),
];

export default visualizations;
