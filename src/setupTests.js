import '@testing-library/jest-dom/extend-expect';
import 'jest-canvas-mock';
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

jest.mock('react-dnd', () => ({
    useDrag: jest.fn().mockImplementation(() => [jest.fn(), jest.fn(), jest.fn()]),
    useDrop: jest.fn().mockImplementation(() => [jest.fn(), jest.fn(), jest.fn()]),
}));

const nextRouterMock = require('next-router-mock');

jest.mock('next/router', () => nextRouterMock);

jest.mock('next/navigation', () => {
    const { useRouter } = nextRouterMock;
    const usePathname = () => {
        const router = useRouter();
        return router.pathname;
    };

    const useSearchParams = () => {
        const router = useRouter();
        return new URLSearchParams(router.query);
    };

    return {
        useRouter,
        usePathname,
        useSearchParams,
        useParams: () => ({}),
    };
});

jest.setTimeout(20000);

// required due to the usage of react-slick https://github.com/akiran/react-slick/issues/742
window.matchMedia =
    window.matchMedia ||
    function () {
        return {
            matches: false,
            addListener() {},
            removeListener() {},
        };
    };
