import 'jest-canvas-mock';
import '@testing-library/jest-dom/extend-expect';
import { server } from 'services/mocks/server';

beforeAll(() => {
    server.listen();
    jest.setTimeout(20000);
});

afterEach(() => {
    server.resetHandlers();
});

afterAll(() => {
    server.close();
});
