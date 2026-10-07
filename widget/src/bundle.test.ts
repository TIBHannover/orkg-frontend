import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { http, HttpResponse } from 'msw';

import { server } from './setupTests';
import type { WidgetParams } from './views/paper';

// Smoke test for the DELIVERED artifact: builds public/widget.js and executes the
// real minified IIFE as a classic script, so a bundling/minification/define
// regression fails CI even when the source-level tests pass.

const widgetDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// baked into the release bundle by widget/build.mjs
const WIDGETS_URL = 'https://orkg.org/api/widgets';

type QueueStub = {
    (api?: string, params?: WidgetParams): void;
    q?: [api?: string, params?: WidgetParams][];
};

type WidgetWindow = Window & Record<string, unknown>;

const w = window as unknown as WidgetWindow;

let bundle: string;

beforeAll(() => {
    execFileSync('node', [path.join(widgetDir, 'build.mjs')], { stdio: 'pipe' });
    bundle = readFileSync(path.resolve(widgetDir, '../public/widget.js'), 'utf8');
});

const runBundle = () => {
    // classic-script semantics: the IIFE sees the jsdom window/document and the
    // MSW-patched global fetch
    new Function('window', 'document', bundle).call(window, window, document);
};

const installSnippet = (queue: QueueStub['q']) => {
    const stub: QueueStub = () => {};
    stub.q = queue;
    w['ORKG-Widget'] = 'orkgw';
    w.orkgw = stub;
    return stub;
};

describe('built bundle (public/widget.js)', () => {
    afterEach(() => {
        delete w['ORKG-Widget'];
        delete w.orkgw;
        document.body.innerHTML = '';
    });

    it('drains the queued call and renders using the baked production URLs', async () => {
        document.body.innerHTML = '<div class="orkg-widget" data-doi="10.1007/s00799-015-0158-y"></div>';
        // handler is registered on the exact baked backend URL; a wrong define would
        // surface as an unhandled request (the widget server errors on those)
        server.use(http.get(WIDGETS_URL, () => HttpResponse.json({ id: 'R1', class: 'Paper', num_statements: 7 })));
        installSnippet([['paper', { language: 'en' }]]);
        runBundle();
        await vi.waitFor(() => {
            expect(document.querySelector('.orkg-widget-box')).not.toBeNull();
        });
        expect(document.querySelector('.orkg-widget-txt-link')?.textContent).toBe('Open in ORKG');
        expect(document.querySelector('.orkg-widget-link')?.getAttribute('href')).toBe('https://orkg.org/papers/R1');
        expect(document.querySelector('.orkg-widget-statements')?.textContent).toBe('7');
        expect(document.querySelector<HTMLImageElement>('.orkg-widget-icon')!.src).toMatch(/^data:image\/png;base64,/);
    });

    it('replaces the queue stub with the real handler so post-load calls render', async () => {
        document.body.innerHTML = '<div class="orkg-widget" data-doi="10.1007/s00799-015-0158-y"></div>';
        server.use(http.get(WIDGETS_URL, () => HttpResponse.json({ id: 'R2', class: 'Paper', num_statements: 3 })));
        const stub = installSnippet([]);
        runBundle();
        expect(w.orkgw).not.toBe(stub);
        (w.orkgw as QueueStub)('paper', { language: 'en' });
        await vi.waitFor(() => {
            expect(document.querySelector('.orkg-widget-box')).not.toBeNull();
        });
        expect(document.querySelector('.orkg-widget-link')?.getAttribute('href')).toBe('https://orkg.org/papers/R2');
    });

    it('renders German labels (raw UTF-8 survives minification)', async () => {
        document.body.innerHTML = '<div class="orkg-widget" data-doi="10.1007/s00799-015-0158-y"></div>';
        server.use(http.get(WIDGETS_URL, () => HttpResponse.json({ id: 'R3', class: 'Paper', num_statements: 1 })));
        installSnippet([['paper', { language: 'de' }]]);
        runBundle();
        await vi.waitFor(() => {
            expect(document.querySelector('.orkg-widget-box')).not.toBeNull();
        });
        expect(document.querySelector('.orkg-widget-txt-link')?.textContent).toBe('In ORKG öffnen');
        expect(document.querySelector('.orkg-widget-text-statements')?.textContent).toBe('Anzahl der Aussagen');
    });

    it('injects the widget styles into the document head', () => {
        installSnippet([]);
        runBundle();
        const styleTags = Array.from(document.head.getElementsByTagName('style'));
        expect(styleTags.some((tag) => tag.textContent?.includes('.orkg-widget-box'))).toBe(true);
    });
});
