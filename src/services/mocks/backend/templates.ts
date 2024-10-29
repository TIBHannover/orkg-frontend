import { http, HttpResponse } from 'msw';
import { templatesUrl } from 'services/backend/templates';
import { Template } from 'services/backend/types';
import {
    templateR0TemplateR40006,
    templateR35077,
    templateR35087,
    templateR44415,
    templateR48000,
    strictTemplate,
} from 'services/mocks/backend/__mocks__/Templates';

const templates = [
    http.get(`${templatesUrl}:id`, ({ params }) => {
        const { id } = params as { id: string };
        if (!id) {
            throw new Error();
        }
        const MAPPING: Record<string, Template> = {
            R48000: templateR48000,
            R35087: templateR35087,
            R35077: templateR35077,
            R44415: templateR44415,
            R40006: templateR0TemplateR40006,
            StrictTemplateResource: strictTemplate,
        };
        if (MAPPING[id]) {
            return HttpResponse.json(MAPPING[id]);
        }
        return new HttpResponse(null, {
            status: 404,
            statusText: 'Not Found',
        });
    }),
    http.get(templatesUrl, ({ request }) => {
        const url = new URL(request.url);
        const targetClass = url.searchParams.get('target_class') as string | null;
        const MAPPING: Record<string, Template> = {
            C4000: templateR0TemplateR40006,
            Problem: templateR48000,
            C2005: templateR35087,
            C2003: templateR35077,
            C5001: templateR44415,
            StrictTemplateClass: strictTemplate,
        };
        if (targetClass && targetClass in MAPPING) {
            return HttpResponse.json({
                content: [MAPPING[targetClass]],
                pageable: {
                    sort: { empty: false, sorted: true, unsorted: false },
                    offset: 0,
                    pageNumber: 0,
                    pageSize: 999,
                    paged: true,
                    unpaged: false,
                },
                last: true,
                totalElements: 1,
                totalPages: 1,
                size: 999,
                number: 0,
                sort: { empty: false, sorted: true, unsorted: false },
                numberOfElements: 1,
                first: true,
                empty: false,
            });
        }
        return HttpResponse.json({
            content: [],
            pageable: { sort: { empty: false, sorted: true, unsorted: false }, offset: 0, pageNumber: 0, pageSize: 999, paged: true, unpaged: false },
            last: true,
            totalElements: 0,
            totalPages: 0,
            size: 999,
            number: 0,
            sort: { empty: false, sorted: true, unsorted: false },
            numberOfElements: 0,
            first: true,
            empty: true,
        });
    }),
];

export default templates;
