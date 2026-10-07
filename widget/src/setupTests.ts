import { setupServer } from 'msw/node';

// Widget-local MSW server: unhandled requests are an error, so a test that
// forgets to register a handler fails loudly instead of hitting the network.
export const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
