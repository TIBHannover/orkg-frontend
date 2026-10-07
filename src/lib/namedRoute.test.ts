import { describe, expect, it } from 'vitest';

import ROUTES from '@/constants/routes';
import { canonicalTabPath, reverse } from '@/lib/namedRoute';

describe('reverse', () => {
    it('substitutes params into a pattern', () => {
        expect(reverse('/papers/:resourceId', { resourceId: 'R123' })).toBe('/papers/R123');
    });

    it('returns the pattern unchanged when compilation fails', () => {
        expect(reverse('/papers/:resourceId')).toBe('/papers/:resourceId');
    });
});

describe('ROUTES', () => {
    // Next's default `trailingSlash: false` 308-redirects `/foo/` to `/foo`, so a pattern ending in a
    // slash makes every link built from it hit a redirect — and makes any canonical built from it point
    // at a non-200 URL. `HOME` is the only legitimate bare slash.
    it('has no pattern with a trailing slash', () => {
        const offenders = Object.entries(ROUTES).filter(([, pattern]) => pattern !== '/' && pattern.endsWith('/'));
        expect(offenders).toEqual([]);
    });

    it('builds the comparison canonical without a trailing slash', () => {
        expect(reverse(ROUTES.COMPARISON, { comparisonId: 'R123' })).toBe('/comparisons/R123');
    });

    // Every pattern used to build an alternates.canonical. A canonical must be a clean path:
    // query-free (a `?` would defeat consolidating ?history= variants) and slash-terminated-free.
    // Kept as an explicit list because some ROUTES legitimately carry a query
    // (CREATE_COMPARISON, REVIEW_NEW, ...).
    const CANONICAL_PATTERNS = [
        ROUTES.COMPARISON,
        ROUTES.VIEW_PAPER,
        ROUTES.VIEW_PAPER_CONTRIBUTION,
        ROUTES.RESOURCE,
        ROUTES.RESOURCE_TABS,
        ROUTES.RESOURCE_SNAPSHOT,
        ROUTES.CONTENT_TYPE,
        ROUTES.CONTENT_TYPE_TABS,
        ROUTES.CONTENT_TYPE_SNAPSHOT,
        ROUTES.REVIEW,
        ROUTES.LIST,
        ROUTES.CLASS,
        ROUTES.CLASS_TABS,
        ROUTES.PROPERTY,
        ROUTES.PROPERTY_TABS,
        ROUTES.TEMPLATE,
        ROUTES.TEMPLATE_TABS,
        ROUTES.RS_TEMPLATE,
        ROUTES.RS_TEMPLATE_TABS,
    ];

    it('keeps every canonical pattern query-free and without a trailing slash', () => {
        const offenders = CANONICAL_PATTERNS.filter((pattern) => pattern.includes('?') || pattern.endsWith('/'));
        expect(offenders).toEqual([]);
    });

    it('builds per-segment self-canonicals for papers', () => {
        expect(reverse(ROUTES.VIEW_PAPER, { resourceId: 'R123' })).toBe('/papers/R123');
        expect(reverse(ROUTES.VIEW_PAPER_CONTRIBUTION, { resourceId: 'R123', contributionId: 'C1' })).toBe('/papers/R123/C1');
    });

    it('re-encodes decoded prefixed ids exactly once, matching the served path', () => {
        expect(reverse(ROUTES.RESOURCE, { id: 'wikidata:Q34' })).toBe('/resources/wikidata%3AQ34');
    });
});

describe('canonicalTabPath', () => {
    const resourceCanonical = (activeTab?: string[]) =>
        canonicalTabPath(ROUTES.RESOURCE, ROUTES.RESOURCE_TABS, { id: 'R1' }, activeTab, 'information');

    it('collapses the default tab onto the bare route — they render the same page', () => {
        expect(resourceCanonical()).toBe('/resources/R1');
        expect(resourceCanonical(['information'])).toBe('/resources/R1');
    });

    it('keeps a non-default tab on its own path', () => {
        expect(resourceCanonical(['statements'])).toBe('/resources/R1/statements');
    });
});
