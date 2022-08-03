import { rest } from 'msw';
import { statementsUrl } from 'services/backend/statements';
import {
    r0COVIDStatements,
    templateOfClassProblem,
    templateOfClassC2005,
    templateOfClassC2003,
    templateOfClassC5001,
    templateOfClassC4000,
    statementsR48000,
    statementsR35087,
    statementsR35077,
    statementsR44415,
    statementsR0TemplateR40006,
    statementsR8184,
    statementsR8174,
    statementsR8185,
    statementsR8182,
    statementsR8181,
    statementsR8177,
    statementsR8172,
    statementsR8173,
    statementsR8178,
    statementsR8175,
    statementsR8166,
    statementsR8170,
    statementsR8184Object,
    statementsR68106,
    templateOfClassC12000,
    templateOfClassC12001,
    statementsR54875,
    statementsR54009,
} from 'services/mocks/backend/__mocks__/Statements';
import faker from 'faker';

const statements = [
    rest.get(`${statementsUrl}:id/bundle/`, (req, res, ctx) => {
        const { id } = req.params;
        if (!id) {
            throw new Error();
        }
        const MAPPING = {
            R44727: r0COVIDStatements,
            R48000: statementsR48000,
            R35087: statementsR35087,
            R35077: statementsR35077,
            R44415: statementsR44415,
            R40006: statementsR0TemplateR40006,
            R68106: statementsR68106,
            R54875: statementsR54875,
            R54009: statementsR54009,
        };
        if (MAPPING[id]) {
            return res(ctx.json(MAPPING[id]));
        }
        return res(ctx.json({ root: id, statements: [] }));
    }),
    rest.get(`${statementsUrl}object/:id`, (req, res, ctx) => {
        const { id } = req.params;
        const MAPPING = {
            R8184: statementsR8184Object,
        };
        if (MAPPING[id]) {
            return res(ctx.json(MAPPING[id]));
        }
        return res(
            ctx.json({
                content: [],
                pageable: {
                    sort: { sorted: true, unsorted: false, empty: false },
                    pageNumber: 0,
                    pageSize: 2000,
                    offset: 0,
                    paged: true,
                    unpaged: false,
                },
                totalPages: 0,
                totalElements: 0,
                last: true,
                first: true,
                sort: { sorted: true, unsorted: false, empty: false },
                size: 2000,
                number: 0,
                numberOfElements: 0,
                empty: true,
            }),
        );
    }),
    rest.get(`${statementsUrl}subject/:id/`, (req, res, ctx) => {
        const { id } = req.params;
        const MAPPING = {
            R8184: statementsR8184,
            R8174: statementsR8174,
            R8185: statementsR8185,
            R8182: statementsR8182,
            R8181: statementsR8181,
            R8177: statementsR8177,
            R8172: statementsR8172,
            R8173: statementsR8173,
            R8178: statementsR8178,
            R8175: statementsR8175,
            R8166: statementsR8166,
            R8170: statementsR8170,
        };
        if (MAPPING[id]) {
            return res(ctx.json(MAPPING[id]));
        }
        return res(
            ctx.json({
                content: [],
                pageable: {
                    sort: { sorted: true, unsorted: false, empty: false },
                    pageNumber: 0,
                    pageSize: 2000,
                    offset: 0,
                    paged: true,
                    unpaged: false,
                },
                totalPages: 0,
                totalElements: 0,
                last: true,
                first: true,
                sort: { sorted: true, unsorted: false, empty: false },
                size: 2000,
                number: 0,
                numberOfElements: 0,
                empty: true,
            }),
        );
    }),
    rest.get(`${statementsUrl}object/:id/predicate/TemplateOfClass/`, (req, res, ctx) => {
        const { id } = req.params;
        const MAPPING = {
            Problem: templateOfClassProblem,
            C2005: templateOfClassC2005,
            C2003: templateOfClassC2003,
            C4000: templateOfClassC4000,
            C5001: templateOfClassC5001,
            C12000: templateOfClassC12000,
            C12001: templateOfClassC12001,
        };
        if (MAPPING[id]) {
            return res(ctx.json(MAPPING[id]));
        }
        return res(
            ctx.json({
                content: [],
                pageable: {
                    sort: { sorted: true, unsorted: false, empty: false },
                    pageNumber: 0,
                    pageSize: 2000,
                    offset: 0,
                    paged: true,
                    unpaged: false,
                },
                totalPages: 0,
                totalElements: 0,
                last: true,
                first: true,
                sort: { sorted: true, unsorted: false, empty: false },
                size: 2000,
                number: 0,
                numberOfElements: 0,
                empty: true,
            }),
        );
    }),
    rest.post(statementsUrl, async (req, res, ctx) => {
        const { subject_id, predicate_id, object_id } = await req.json();
        return res(
            ctx.json({
                id: `S${faker.datatype.number()}`,
                subject: {
                    id: subject_id,
                    label: 'Subject',
                    created_at: '2021-11-15T11:20:41.326694Z',
                    classes: [],
                    shared: 0,
                    created_by: '40f2034c-986b-451f-ac08-67b1bd23fe3d',
                    _class: 'resource',
                    observatory_id: '00000000-0000-0000-0000-000000000000',
                    extraction_method: 'UNKNOWN',
                    organization_id: '00000000-0000-0000-0000-000000000000',
                },
                predicate: {
                    id: predicate_id,
                    label: 'Predicate',
                    created_at: '2020-06-11T17:54:44.198814+02:00',
                    created_by: '1427a1ee-7551-47b1-9152-8274ab6cd7a4',
                    _class: 'predicate',
                    description: null,
                },
                object: {
                    id: object_id,
                    label: 'Object',
                    created_at: '2021-11-15T14:40:27.980176Z',
                    classes: [],
                    shared: 0,
                    created_by: '40f2034c-986b-451f-ac08-67b1bd23fe3d',
                    _class: 'resource',
                    observatory_id: '00000000-0000-0000-0000-000000000000',
                    extraction_method: 'UNKNOWN',
                    organization_id: '00000000-0000-0000-0000-000000000000',
                },
                created_at: '2021-11-15T14:42:08.595765Z',
                created_by: '40f2034c-986b-451f-ac08-67b1bd23fe3d',
            }),
        );
    }),
];

export default statements;
