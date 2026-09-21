import { http, HttpResponse } from 'msw';

import useComparison from '@/components/Comparison/hooks/useComparison';
import { comparisonUrl } from '@/services/backend/comparisons';
import { CapturedRequest, recordRequest } from '@/services/mocks/helpers';
import server from '@/services/mocks/server';
import { act, renderHook, waitFor, Wrapper } from '@/testUtils';

const base = comparisonUrl.replace(/\/+$/, '');

// The update wrapper maps research_fields/sdgs to id arrays and strips the raw objects with an
// untyped rest-spread — the compiler cannot catch a mismatch between the two, so this pins that
// the raw objects never leak into the request body.
describe('useComparison updateComparison', () => {
    it('maps research_fields and sdgs to id arrays in the request body', async () => {
        const captured: CapturedRequest[] = [];
        server.use(
            http.put(`${base}/:id`, async ({ request }) => {
                captured.push(await recordRequest(request));
                return new HttpResponse(null, { status: 204 });
            }),
        );

        const { result } = renderHook(() => useComparison('R1'), { wrapper: Wrapper });
        await waitFor(() => expect(result.current.comparison).toBeDefined());

        await act(async () => {
            await result.current.updateComparison({
                researchFields: [{ id: 'R12', label: 'Computer Sciences' }],
                sdgs: [{ id: 'SDG1', label: 'No Poverty' }],
            });
        });

        await waitFor(() => expect(captured).toHaveLength(1));
        expect(captured[0].body).toEqual({ research_fields: ['R12'], sdgs: ['SDG1'] });
    });

    it('passes other fields through unchanged next to the mapped ones', async () => {
        const captured: CapturedRequest[] = [];
        server.use(
            http.put(`${base}/:id`, async ({ request }) => {
                captured.push(await recordRequest(request));
                return new HttpResponse(null, { status: 204 });
            }),
        );

        const { result } = renderHook(() => useComparison('R1'), { wrapper: Wrapper });
        await waitFor(() => expect(result.current.comparison).toBeDefined());

        await act(async () => {
            await result.current.updateComparison({ title: 'New title', researchFields: [{ id: 'R12', label: 'Computer Sciences' }] });
        });

        await waitFor(() => expect(captured).toHaveLength(1));
        expect(captured[0].body).toEqual({ title: 'New title', research_fields: ['R12'] });
    });
});
