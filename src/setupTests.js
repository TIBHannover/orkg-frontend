import 'jest-canvas-mock';
import '@testing-library/jest-dom/extend-expect';
import { server } from 'services/mocks/server';

beforeAll(async () => {
    server.listen();
    jest.setTimeout(20000);
});

afterEach(() => {
    server.resetHandlers();
});

afterAll(() => {
    server.close();
});

jest.setTimeout(20000);

// required due to the usage of react-slick https://github.com/akiran/react-slick/issues/742
window.matchMedia =
    window.matchMedia ||
    function() {
        return {
            matches: false,
            addListener() {},
            removeListener() {},
        };
    };
