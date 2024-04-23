import { http, HttpResponse } from 'msw';
import { templatesUrl } from 'services/backend/templates';
import {
    templateR0TemplateR40006,
    templateR35077,
    templateR35087,
    templateR44415,
    templateR48000,
    templateR54009,
    templateR54875,
} from 'services/mocks/backend/__mocks__/Templates';

const templates = [
    http.get(`${templatesUrl}:id`, ({ params }) => {
        const { id } = params;
        if (!id) {
            throw new Error();
        }
        const MAPPING = {
            R48000: templateR48000,
            R35087: templateR35087,
            R35077: templateR35077,
            R44415: templateR44415,
            R40006: templateR0TemplateR40006,
            R54875: templateR54875,
            R54009: templateR54009,
        };
        if (MAPPING[id]) {
            return HttpResponse.json(MAPPING[id]);
        }
        return HttpResponse.json({ id, label: id, properties: [] });
    }),
];

export default templates;
