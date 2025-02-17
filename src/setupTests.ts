import '@testing-library/jest-dom/extend-expect';
import 'jest-canvas-mock';
import server from 'services/mocks/server';
import db from 'services/mocks/db';
import seed from 'services/mocks/seed';
import { drop } from '@mswjs/data';
import nextRouterMock, { useRouter } from 'next-router-mock';

beforeAll(async () => {
    server.listen();
    jest.setTimeout(20000);
    seed();
});

afterEach(() => {
    server.resetHandlers();
    drop(db);
    seed();
});

afterAll(() => {
    server.close();
});

jest.mock('react-dnd', () => ({
    useDrag: jest.fn().mockImplementation(() => [jest.fn(), jest.fn(), jest.fn()]),
    useDrop: jest.fn().mockImplementation(() => [jest.fn(), jest.fn(), jest.fn()]),
}));

jest.mock('components/UserAvatar/UserAvatar', () => () => null);

window.scrollTo = jest.fn();

jest.mock('next/router', () => nextRouterMock);

jest.mock('next-auth/react', () => {
    const originalModule = jest.requireActual('next-auth/react');
    const mockSession = {
        expires: new Date(Date.now() + 2 * 86400).toISOString(),
        user: { name: 'test', id: '123', email: 'test@example.com' },
    };
    return {
        __esModule: true,
        ...originalModule,
        useSession: jest.fn(() => {
            return { data: mockSession, status: 'authenticated' };
        }),
        signIn: jest.fn(),
        signOut: jest.fn(),
        log: jest.fn(),
        getSession: jest.fn(),
    };
});

jest.mock('next/navigation', () => {
    const usePathname = () => {
        const router = useRouter();
        return router.pathname;
    };

    const useSearchParams = () => {
        const router = useRouter();
        return new URLSearchParams(router.query as Record<string, string>);
    };

    return {
        useRouter,
        usePathname,
        useSearchParams,
        useParams: () => ({}),
    };
});

jest.setTimeout(20000);

// required due to the usage of react-slick https://github.com/akiran/ts/issues/742
window.matchMedia =
    window.matchMedia ||
    (() => {
        return {
            matches: false,
            addListener() {},
            removeListener() {},
        };
    });
