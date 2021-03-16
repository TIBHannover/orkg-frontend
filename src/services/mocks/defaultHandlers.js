import { rest } from 'msw';

// in case no handler are available, fallback to these handlers
const defaultHandlers = [
    rest.get('*', (req, res, ctx) => res(ctx.status(200), ctx.json({}))),
    rest.post('*', (req, res, ctx) => res(ctx.status(200), ctx.json({}))),
    rest.patch('*', (req, res, ctx) => res(ctx.status(200), ctx.json({}))),
    rest.put('*', (req, res, ctx) => res(ctx.status(200), ctx.json({}))),
    rest.delete('*', (req, res, ctx) => res(ctx.status(200), ctx.json({})))
];

export default defaultHandlers;
