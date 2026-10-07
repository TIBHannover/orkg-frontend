import type { WidgetParams } from './views/paper';

vi.mock('./views/paper', () => ({
    show: vi.fn(),
}));

type QueueStub = {
    (api?: string, params?: WidgetParams): void;
    q?: [api?: string, params?: WidgetParams][];
};

type WidgetWindow = Window & Record<string, unknown>;

const w = window as unknown as WidgetWindow;

// main.ts runs app(window) at import time, so each test loads a fresh module
// after arranging the embed-snippet globals.
const loadWidget = async () => {
    vi.resetModules();
    const paper = await import('./views/paper');
    await import('./main');
    return vi.mocked(paper.show);
};

const installSnippet = (queue?: QueueStub['q']) => {
    const stub: QueueStub = () => {};
    stub.q = queue;
    w['ORKG-Widget'] = 'orkgw';
    w.orkgw = stub;
};

describe('widget bootstrap', () => {
    afterEach(() => {
        delete w['ORKG-Widget'];
        delete w.orkgw;
        // the vi.mock factory result is cached across vi.resetModules(), so the
        // same vi.fn instance accumulates calls between tests
        vi.clearAllMocks();
    });

    it('processes calls queued before the script loaded', async () => {
        installSnippet([['paper', { language: 'en' }]]);
        const show = await loadWidget();
        expect(show).toHaveBeenCalledTimes(1);
        expect(show).toHaveBeenCalledWith({ language: 'en' });
    });

    it('replaces the queue stub so calls made after load run immediately', async () => {
        installSnippet([]);
        const show = await loadWidget();
        expect(show).not.toHaveBeenCalled();
        (w.orkgw as QueueStub)('paper', { language: 'de' });
        expect(show).toHaveBeenCalledWith({ language: 'de' });
    });

    it('matches API method names case-insensitively', async () => {
        installSnippet([]);
        const show = await loadWidget();
        (w.orkgw as QueueStub)('PAPER');
        expect(show).toHaveBeenCalledTimes(1);
    });

    it('throws for an unsupported API method', async () => {
        installSnippet([]);
        await loadWidget();
        expect(() => (w.orkgw as QueueStub)('foo')).toThrow('Method foo is not supported');
    });

    it('throws when the API method is missing', async () => {
        installSnippet([]);
        await loadWidget();
        expect(() => (w.orkgw as QueueStub)()).toThrow('API method required');
    });

    it('installs the handler even when no calls were queued', async () => {
        installSnippet(undefined);
        const show = await loadWidget();
        (w.orkgw as QueueStub)('paper');
        expect(show).toHaveBeenCalledWith(undefined);
    });

    it('does nothing when the embed snippet is absent', async () => {
        await expect(loadWidget()).resolves.toBeDefined();
        expect(w.orkgw).toBeUndefined();
    });
});
