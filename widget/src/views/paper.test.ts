import { http, HttpResponse } from 'msw';

import { server } from '../setupTests';
import { show } from './paper';

const WIDGETS_URL = 'https://orkg.org/api/widgets';
const DOI = '10.1007/s00799-015-0158-y';

const setWidgetDiv = (doi: string = DOI) => {
    document.body.innerHTML = `<div class="orkg-widget" data-doi="${doi}"></div>`;
};

const mockWidgetResponse = (body: object, status = 200) => {
    server.use(http.get(WIDGETS_URL, () => HttpResponse.json(body, { status })));
};

const waitForBox = () =>
    vi.waitFor(() => {
        expect(document.querySelector('.orkg-widget-box')).not.toBeNull();
    });

const link = () => document.querySelector<HTMLAnchorElement>('.orkg-widget-link')!;
const text = (selector: string) => document.querySelector(selector)?.textContent;

describe('show', () => {
    it('renders the open-in-ORKG box for a found paper', async () => {
        setWidgetDiv();
        mockWidgetResponse({ id: 'R1', class: 'Paper', num_statements: 42 });
        show({ language: 'en' });
        await waitForBox();
        expect(text('.orkg-widget-txt-link')).toBe('Open in ORKG');
        expect(text('.orkg-widget-text-statements')).toBe('Number of statements');
        expect(text('.orkg-widget-statements')).toBe('42');
        expect(link().getAttribute('href')).toBe('https://orkg.org/papers/R1');
        expect(link().target).toBe('_blank');
        expect(document.querySelector<HTMLImageElement>('.orkg-widget-icon')!.src).toMatch(/^data:image\/png;base64,/);
    });

    it('links a comparison to the comparison page and hides the statements count', async () => {
        setWidgetDiv();
        mockWidgetResponse({ id: 'C1', class: 'Comparison', num_statements: 0 });
        show({ language: 'en' });
        await waitForBox();
        expect(link().getAttribute('href')).toBe('https://orkg.org/comparisons/C1');
        const description = document.querySelector<HTMLElement>('.orkg-widget-description');
        expect(description).not.toBeNull();
        expect(description!.style.display).toBe('none');
    });

    it('links any other entity class to the resource page', async () => {
        setWidgetDiv();
        mockWidgetResponse({ id: 'R99', class: 'SmartReviewPublished', num_statements: 0 });
        show({ language: 'en' });
        await waitForBox();
        expect(link().getAttribute('href')).toBe('https://orkg.org/resources/R99');
        expect(document.querySelector<HTMLElement>('.orkg-widget-description')!.style.display).toBe('none');
    });

    it('renders the add-paper CTA when the backend responds with an error status', async () => {
        setWidgetDiv();
        mockWidgetResponse({}, 404);
        show({ language: 'en' });
        await waitForBox();
        expect(text('.orkg-widget-txt-link')).toBe('Add paper to ORKG');
        expect(link().getAttribute('href')).toBe(`https://orkg.org/content-type/create?type=Paper&entry=${DOI}`);
        expect(document.querySelector('.orkg-widget-description')).toBeNull();
    });

    it('renders the add-paper CTA on a network failure', async () => {
        setWidgetDiv();
        server.use(http.get(WIDGETS_URL, () => HttpResponse.error()));
        show({ language: 'en' });
        await waitForBox();
        expect(text('.orkg-widget-txt-link')).toBe('Add paper to ORKG');
        expect(document.querySelector('.orkg-widget-description')).toBeNull();
    });

    it('renders German strings for language "de"', async () => {
        setWidgetDiv();
        mockWidgetResponse({ id: 'R1', class: 'Paper', num_statements: 3 });
        show({ language: 'de' });
        await waitForBox();
        expect(text('.orkg-widget-txt-link')).toBe('In ORKG öffnen');
        expect(text('.orkg-widget-text-statements')).toBe('Anzahl der Aussagen');
    });

    it('renders the German add-paper CTA for language "de"', async () => {
        setWidgetDiv();
        mockWidgetResponse({}, 404);
        show({ language: 'de' });
        await waitForBox();
        expect(text('.orkg-widget-txt-link')).toBe('Artikel zu ORKG hinzufügen');
    });

    it('falls back to English for an unsupported language', async () => {
        setWidgetDiv();
        mockWidgetResponse({ id: 'R1', class: 'Paper', num_statements: 3 });
        show({ language: 'fr' });
        await waitForBox();
        expect(text('.orkg-widget-txt-link')).toBe('Open in ORKG');
    });

    it('does not throw and falls back to English when params are missing', async () => {
        setWidgetDiv();
        mockWidgetResponse({ id: 'R1', class: 'Paper', num_statements: 3 });
        expect(() => show()).not.toThrow();
        await waitForBox();
        expect(text('.orkg-widget-txt-link')).toBe('Open in ORKG');
    });

    it('does not throw on a DOI that decodeURIComponent rejects and sends it as-is', async () => {
        const malformedDoi = '10.1000/a%b';
        setWidgetDiv(malformedDoi);
        let requestedDoi: string | null = null;
        server.use(
            http.get(WIDGETS_URL, ({ request }) => {
                requestedDoi = new URL(request.url).searchParams.get('doi');
                return HttpResponse.json({}, { status: 404 });
            }),
        );
        expect(() => show({ language: 'en' })).not.toThrow();
        await waitForBox();
        expect(requestedDoi).toBe(malformedDoi);
        expect(link().getAttribute('href')).toBe(`https://orkg.org/content-type/create?type=Paper&entry=${malformedDoi}`);
    });

    it('renders a box in every .orkg-widget container on the page', async () => {
        document.body.innerHTML = `
            <div class="orkg-widget" data-doi="${DOI}"></div>
            <div class="orkg-widget" data-doi="${DOI}"></div>
        `;
        mockWidgetResponse({ id: 'R1', class: 'Paper', num_statements: 1 });
        show({ language: 'en' });
        await vi.waitFor(() => {
            expect(document.querySelectorAll('.orkg-widget-box')).toHaveLength(2);
        });
    });

    it('injects the widget styles into the document head', () => {
        const styleTags = Array.from(document.head.getElementsByTagName('style'));
        expect(styleTags.some((tag) => tag.textContent?.includes('.orkg-widget-box'))).toBe(true);
    });
});
