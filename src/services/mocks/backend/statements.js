import { rest } from 'msw';
import { statementsUrl } from 'services/backend/statements';
import {
    r0COVIDStatements,
    templateOfClassProblem,
    templateOfClassC2005,
    templateOfClassC2003,
    templateOfClassC5001,
    statementsR48000,
    statementsR35087,
    statementsR35077,
    statementsR44415
} from 'services/mocks/backend/__mocks__/Statements';

const statements = [
    rest.get(`${statementsUrl}:id/bundle/`, (req, res, ctx) => {
        const { id } = req.params;
        const MAPPING = {
            R44727: r0COVIDStatements,
            R48000: statementsR48000,
            R35087: statementsR35087,
            R35077: statementsR35077,
            R44415: statementsR44415
        };
        if (MAPPING[id]) {
            return res(ctx.json(MAPPING[id]));
        } else {
            return res(ctx.json({ root: id, statements: [] }));
        }
    }),
    rest.get(`${statementsUrl}object/:id/predicate/TemplateOfClass/`, (req, res, ctx) => {
        const { id } = req.params;
        const MAPPING = {
            Problem: templateOfClassProblem,
            C2005: templateOfClassC2005,
            C2003: templateOfClassC2003,
            C5001: templateOfClassC5001
        };
        if (MAPPING[id]) {
            return res(ctx.json(MAPPING[id]));
        } else {
            return res(ctx.json(MAPPING['Problem']));
        }
    })
];

export default statements;
