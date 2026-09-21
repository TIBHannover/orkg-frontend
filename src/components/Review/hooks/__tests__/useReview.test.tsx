import { http, HttpResponse } from 'msw';

import useReview from '@/components/Review/hooks/useReview';
import { reviewUrl } from '@/services/backend/reviews';
import { CapturedRequest, recordRequest } from '@/services/mocks/helpers';
import server from '@/services/mocks/server';
import { act, renderHook, waitFor, Wrapper } from '@/testUtils';

const base = reviewUrl.replace(/\/+$/, '');

// The update wrapper maps research_fields/sdgs/sections and strips the raw objects with an
// untyped rest-spread — the compiler cannot catch a mismatch between the two, so this pins that
// the raw objects never leak into the request body.
describe('useReview updateReview', () => {
    it('maps research_fields and sdgs to id arrays in the request body', async () => {
        const captured: CapturedRequest[] = [];
        server.use(
            http.put(`${base}/:id`, async ({ request }) => {
                captured.push(await recordRequest(request));
                return new HttpResponse(null, { status: 204 });
            }),
        );

        const { result } = renderHook(() => useReview('R1'), { wrapper: Wrapper });
        await waitFor(() => expect(result.current.review).toBeDefined());

        await act(async () => {
            await result.current.updateReview({
                researchFields: [{ id: 'R12', label: 'Computer Sciences' }],
                sdgs: [{ id: 'SDG1', label: 'No Poverty' }],
            });
        });

        await waitFor(() => expect(captured).toHaveLength(1));
        expect(captured[0].body).toEqual({ research_fields: ['R12'], sdgs: ['SDG1'] });
    });

    it('maps a mixed sections array to wire payloads, keeping every variant field', async () => {
        const captured: CapturedRequest[] = [];
        server.use(
            http.put(`${base}/:id`, async ({ request }) => {
                captured.push(await recordRequest(request));
                return new HttpResponse(null, { status: 204 });
            }),
        );

        const { result } = renderHook(() => useReview('R1'), { wrapper: Wrapper });
        await waitFor(() => expect(result.current.review).toBeDefined());

        const { sections } = result.current.review!;
        await act(async () => {
            // reorder the fixture's sections (text + comparison) — the bulk update path
            await result.current.updateReview({ sections: [sections[1], sections[0]] });
        });

        await waitFor(() => expect(captured).toHaveLength(1));
        const body = captured[0].body as { sections: Record<string, unknown>[] };
        // the comparison section keeps its reference
        expect(body.sections[0]).toMatchObject({ heading: 'Comparison section', comparison: 'R200' });
        // the text section keeps its text
        expect(body.sections[1]).toMatchObject({ heading: 'Introduction', text: 'Section text' });
    });
});
