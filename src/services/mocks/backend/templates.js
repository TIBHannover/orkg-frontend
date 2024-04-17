import { rest } from 'msw';
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
    rest.get(`${templatesUrl}:id`, (req, res, ctx) => {
        const { id } = req.params;
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
            return res(ctx.json(MAPPING[id]));
        }
        return res(ctx.json({ id, label: id, properties: [] }));
    }),
];

export default templates;
