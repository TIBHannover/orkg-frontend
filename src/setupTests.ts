import { drop } from '@mswjs/data';
import '@testing-library/jest-dom/extend-expect';
import { useRouter } from 'next-router-mock';
import db from 'services/mocks/db';
import seed from 'services/mocks/seed';
import server from 'services/mocks/server';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';

vi.mock('next-client-cookies', () => {
    return {
        useCookies: () => ({
            get: vi.fn().mockReturnValue(null),
            set: vi.fn(),
            remove: vi.fn(),
        }),
    };
});

beforeAll(async () => {
    server.listen();
    vi.setConfig({ testTimeout: 20000 });
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

window.scrollTo = vi.fn();

vi.mock('react-dnd', () => ({
    useDrag: vi.fn().mockImplementation(() => [vi.fn(), vi.fn(), vi.fn()]),
    useDrop: vi.fn().mockImplementation(() => [vi.fn(), vi.fn(), vi.fn()]),
}));

vi.mock('components/UserAvatar/UserAvatar', () => ({
    default: () => null,
}));

window.scrollTo = vi.fn();

vi.mock('next-auth/react', () => {
    const originalModule = vi.importActual('next-auth/react');
    const mockSession = {
        expires: new Date(Date.now() + 2 * 86400).toISOString(),
        user: { name: 'test', id: '123', email: 'test@example.com' },
    };
    return {
        __esModule: true,
        ...originalModule,
        useSession: vi.fn(() => {
            return { data: mockSession, status: 'authenticated' };
        }),
        signIn: vi.fn(),
        signOut: vi.fn(),
        log: vi.fn(),
        getSession: vi.fn(),
    };
});

global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

vi.mock('next/navigation', () => {
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

vi.setConfig({ testTimeout: 20000 });

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
