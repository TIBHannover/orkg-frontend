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
                page: {
                    total_pages: 1,
                    total_elements: 1,
                    size: 999,
                    number: 0,
                },
            });
        }
        return HttpResponse.json({
            content: [],
            page: {
                total_pages: 0,
                total_elements: 0,
                size: 999,
                number: 0,
            },
        });
    }),
];

export default templates;
