import { http, HttpResponse } from 'msw';

import { VISIBILITY_FILTERS } from '@/constants/contentTypes';
import { comparisonUrl, deleteComparison, getComparison } from '@/services/backend/comparisons';
import { getResources, getSnapshot, getSnapshots, resourcesUrl } from '@/services/backend/resources';
import { templatesUrl, updateTemplate } from '@/services/backend/templates';
import { getThings, thingsUrl } from '@/services/backend/things';
import { VisibilityFilter } from '@/services/backend/types';
import { createMSWComparison } from '@/services/mocks/backend/comparisons';
import { CapturedRequest, recordRequest } from '@/services/mocks/helpers';
import server from '@/services/mocks/server';

/**
 * Request-level regression tests for the wire contracts the backend enforces but `tsc` cannot
 * see. Each block pins what a service function actually sends — URL, query params, headers,
 * body — because every one of these has already broken once without a type error or a failing
 * unit test. They protect against our own refactors (especially of
 * `transformPaginationParams`); backend drift is out of their reach by construction.
 */

const emptyPage = { content: [], page: { total_pages: 0, total_elements: 0, size: 0, number: 0 } };

const capture = (method: 'get' | 'put' | 'delete', url: string, response: () => Response) => {
    const captured: CapturedRequest[] = [];
    server.use(
        http[method](url, async ({ request }) => {
            captured.push(await recordRequest(request));
            return response();
        }),
    );
    return captured;
};

describe('empty filter values are not sent', () => {
    // the backend does not read an empty parameter as "no filter": `base_class=` makes
    // GET /resources fail outright (every autocomplete returned no results) and `q=` flips
    // the endpoint into search mode
    it('drops blank q and base_class from GET /resources', async () => {
        const captured = capture('get', resourcesUrl, () => HttpResponse.json(emptyPage));

        await getResources({ q: '', baseClass: '' });

        const { searchParams } = captured[0].url;
        expect(searchParams.has('q')).toBe(false);
        expect(searchParams.has('exact')).toBe(false);
        expect(searchParams.has('base_class')).toBe(false);
        expect(searchParams.has('baseClass')).toBe(false);
        // not searching, so the default listing order is sent
        expect(searchParams.get('sort')).toBe('created_at,desc');
    });
});

describe('search requests carry no sort', () => {
    // with `q` the endpoint ranks by relevance and ignores `sort`; sending one anyway silently
    // reordered the template and Rosetta-template listings before the transform learned this
    it('sends q without sort on GET /resources', async () => {
        const captured = capture('get', resourcesUrl, () => HttpResponse.json(emptyPage));

        await getResources({ q: 'covid' });

        const { searchParams } = captured[0].url;
        expect(searchParams.get('q')).toBe('covid');
        expect(searchParams.has('sort')).toBe(false);
    });
});

describe('GET /things visibility filter', () => {
    it('sends no visibility for the pseudo-values that are not wire visibilities', async () => {
        const captured = capture('get', thingsUrl, () => HttpResponse.json(emptyPage));

        await getThings({ visibility: 'Literal' as VisibilityFilter });
        await getThings({ visibility: VISIBILITY_FILTERS.TOP_RECENT });

        for (const { url } of captured) {
            expect(url.searchParams.has('visibility')).toBe(false);
            expect(url.searchParams.has('type')).toBe(false);
        }
    });

    // the filter only matches resources on this mixed endpoint, so a default ALL_LISTED emptied
    // every literal/class/predicate on the search page; only an explicit visibility reaches the wire
    it('sends no visibility unless a caller explicitly asks for one', async () => {
        const captured = capture('get', thingsUrl, () => HttpResponse.json(emptyPage));

        await getThings({ q: 'knowledge graph', include: ['Literal'] });
        await getThings({ q: 'knowledge graph', include: ['Class'], visibility: VISIBILITY_FILTERS.FEATURED });

        expect(captured[0].url.searchParams.has('visibility')).toBe(false);
        expect(captured[1].url.searchParams.get('visibility')).toBe('FEATURED');
    });
});

describe('clearing template fields', () => {
    // the backend rejects "" with `400 must not be blank` and only nulls a field for an
    // explicit null, so a cleared field must reach the wire as null — not "" and not omitted
    it('sends an explicit null for cleared description and formatted label', async () => {
        const captured = capture('put', `${templatesUrl}/:id`, () => new HttpResponse(null, { status: 204 }));

        await updateTemplate('R1', { description: null, formattedLabel: null });

        const body = captured[0].body as Record<string, unknown>;
        expect(body).toHaveProperty('description', null);
        expect(body).toHaveProperty('formatted_label', null);
    });

    it('omits untouched fields instead of clearing them', async () => {
        const captured = capture('put', `${templatesUrl}/:id`, () => new HttpResponse(null, { status: 204 }));

        await updateTemplate('R1', { label: 'renamed' });

        const body = captured[0].body as Record<string, unknown>;
        expect(body).toEqual({ label: 'renamed' });
    });
});

describe('comparison media types', () => {
    const COMPARISON_MEDIA_TYPE = 'application/vnd.orkg.comparison.v3+json';

    // the endpoint answers 406/415 to anything but exactly this versioned media type, which the
    // spec does not declare — the header has to be passed explicitly per call
    it('requests a comparison with the versioned Accept header', async () => {
        const captured = capture('get', `${comparisonUrl}/:id`, () => HttpResponse.json(createMSWComparison('R1')));

        await getComparison('R1');

        expect(captured[0].headers.get('accept')).toBe(COMPARISON_MEDIA_TYPE);
    });

    it('deletes a comparison with the versioned Content-Type header', async () => {
        const captured = capture('delete', `${comparisonUrl}/:id`, () => new HttpResponse(null, { status: 204 }));

        await deleteComparison('R1');

        expect(captured[0].headers.get('content-type')).toBe(COMPARISON_MEDIA_TYPE);
    });
});

describe('resource snapshots', () => {
    // the one listing that resolves only camelCase sort properties and 400s on snake_case; the
    // shared transform aliases every sort to snake, so the camelCase sort must survive it
    it('lists snapshots with a camelCase sort', async () => {
        const captured = capture('get', `${resourcesUrl}/:id/snapshots`, () => HttpResponse.json(emptyPage));

        await getSnapshots({ id: 'R1' });

        expect(captured[0].url.searchParams.get('sort')).toBe('createdAt,desc');
    });

    // the snapshot URL doubles as a PID landing page: anything but exactly
    // `Accept: application/json` (including the fetch default `*/*`) is 308-redirected to the
    // frontend page, whose HTML then fails JSON parsing
    it('fetches a snapshot with Accept: application/json', async () => {
        const wireResource = {
            id: 'R1',
            label: 'resource',
            classes: [],
            shared: 0,
            created_at: '2026-01-01T00:00:00Z',
            created_by: 'user',
            featured: false,
            unlisted: false,
            verified: false,
            extraction_method: 'UNKNOWN',
            organization_id: '',
            observatory_id: '',
            _class: 'resource',
        };
        const captured = capture('get', `${resourcesUrl}/:id/snapshots/:snapshotId`, () =>
            HttpResponse.json({
                id: 'g1',
                created_at: '2026-01-01T00:00:00Z',
                created_by: 'user',
                data: { root: wireResource, predicates: {}, statements: {} },
                resource_id: 'R1',
                template_id: 'R2',
            }),
        );

        await getSnapshot({ id: 'R1', snapshotId: 'g1' });

        expect(captured[0].headers.get('accept')).toBe('application/json');
    });
});
