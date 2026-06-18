import { ResponseError } from '@orkg/orkg-client';

import { normalizeProblemDetails, parseProblemDetails, pointerToFieldPath } from '@/services/backend/problemDetails';

describe('pointerToFieldPath', () => {
    it('strips the leading slash for a top-level field', () => {
        expect(pointerToFieldPath('/name')).toBe('name');
    });

    it('converts a nested pointer into a dotted react-hook-form path', () => {
        expect(pointerToFieldPath('/items/0/name')).toBe('items.0.name');
    });

    it('decodes RFC 6901 escape sequences', () => {
        expect(pointerToFieldPath('/a~1b/c~0d')).toBe('a/b.c~d');
    });

    it('returns an empty string for an empty pointer', () => {
        expect(pointerToFieldPath('')).toBe('');
    });
});

describe('normalizeProblemDetails', () => {
    it('reads the RFC 9457 fields', () => {
        const problem = normalizeProblemDetails({
            type: 'orkg:problem:invalid_label',
            title: 'Invalid label',
            status: 400,
            detail: 'The label is invalid.',
            instance: '/organizations/R1',
            errors: [{ pointer: '/name', detail: 'must not be blank' }],
        });

        expect(problem).toEqual({
            type: 'orkg:problem:invalid_label',
            title: 'Invalid label',
            status: 400,
            detail: 'The label is invalid.',
            instance: '/organizations/R1',
            errors: [{ pointer: '/name', detail: 'must not be blank' }],
        });
    });

    it('falls back to the deprecated fields (error/path/message + errors[].field/message)', () => {
        const problem = normalizeProblemDetails({
            status: 400,
            error: 'Bad Request',
            path: '/organizations/R1',
            timestamp: '2026-01-01T00:00:00Z',
            message: 'Validation failed',
            errors: [{ field: 'url', message: 'must be a valid URL' }],
        });

        expect(problem).toMatchObject({
            title: 'Bad Request',
            detail: 'Validation failed',
            instance: '/organizations/R1',
            status: 400,
            errors: [{ pointer: '/url', detail: 'must be a valid URL' }],
        });
    });

    it('prefers the new fields over the deprecated ones', () => {
        const problem = normalizeProblemDetails({
            title: 'New title',
            error: 'Old error',
            detail: 'New detail',
            message: 'Old message',
            errors: [{ pointer: '/name', field: 'old', detail: 'New', message: 'Old' }],
        });

        expect(problem).toMatchObject({
            title: 'New title',
            detail: 'New detail',
            errors: [{ pointer: '/name', detail: 'New' }],
        });
    });

    it('returns null for an object that is not a problem body', () => {
        expect(normalizeProblemDetails({ foo: 'bar' })).toBeNull();
    });

    it('does not treat a plain Error as a problem body', () => {
        expect(normalizeProblemDetails(new Error('network down'))).toBeNull();
    });

    it('returns null for non-objects', () => {
        expect(normalizeProblemDetails(null)).toBeNull();
        expect(normalizeProblemDetails('boom')).toBeNull();
        expect(normalizeProblemDetails(undefined)).toBeNull();
    });
});

describe('parseProblemDetails', () => {
    const body = { title: 'Invalid label', status: 400, errors: [{ pointer: '/name', detail: 'must not be blank' }] };

    it('reads the body from an orkg-client ResponseError', async () => {
        const error = new ResponseError(new Response(JSON.stringify(body), { status: 400 }));
        await expect(parseProblemDetails(error)).resolves.toMatchObject({ title: 'Invalid label' });
    });

    it('reads the body from a ky-style error carrying a Response', async () => {
        const error = { response: new Response(JSON.stringify(body), { status: 400 }) };
        await expect(parseProblemDetails(error)).resolves.toMatchObject({ title: 'Invalid label' });
    });

    it('uses an already-parsed body directly (ky non-GET path)', async () => {
        await expect(parseProblemDetails(body)).resolves.toMatchObject({ title: 'Invalid label' });
    });

    it('returns null for a plain Error', async () => {
        await expect(parseProblemDetails(new Error('network down'))).resolves.toBeNull();
    });

    it('returns null when the response body is not valid JSON', async () => {
        const error = new ResponseError(new Response('<html>oops</html>', { status: 500 }));
        await expect(parseProblemDetails(error)).resolves.toBeNull();
    });
});
