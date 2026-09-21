import { http, HttpResponse } from 'msw';

import useList from '@/components/List/hooks/useList';
import { literatureListsUrl } from '@/services/backend/literatureLists';
import { CapturedRequest, recordRequest } from '@/services/mocks/helpers';
import server from '@/services/mocks/server';
import { act, renderHook, waitFor, Wrapper } from '@/testUtils';

const base = literatureListsUrl.replace(/\/+$/, '');

// The update wrapper maps research_fields/sdgs/sections and strips the raw objects with an
// untyped rest-spread — the compiler cannot catch a mismatch between the two, so this pins that
// the raw objects never leak into the request body.
describe('useList updateList', () => {
    it('maps research_fields and sdgs to id arrays in the request body', async () => {
        const captured: CapturedRequest[] = [];
        server.use(
            http.put(`${base}/:id`, async ({ request }) => {
                captured.push(await recordRequest(request));
                return new HttpResponse(null, { status: 204 });
            }),
        );

        const { result } = renderHook(() => useList('R1'), { wrapper: Wrapper });
        await waitFor(() => expect(result.current.list).toBeDefined());

        await act(async () => {
            await result.current.updateList({
                researchFields: [{ id: 'R12', label: 'Computer Sciences' }],
                sdgs: [{ id: 'SDG1', label: 'No Poverty' }],
            });
        });

        await waitFor(() => expect(captured).toHaveLength(1));
        expect(captured[0].body).toEqual({ research_fields: ['R12'], sdgs: ['SDG1'] });
    });

    it('maps sections to their update payloads (text sections lose id and type)', async () => {
        const captured: CapturedRequest[] = [];
        server.use(
            http.put(`${base}/:id`, async ({ request }) => {
                captured.push(await recordRequest(request));
                return new HttpResponse(null, { status: 204 });
            }),
        );

        const { result } = renderHook(() => useList('R1'), { wrapper: Wrapper });
        await waitFor(() => expect(result.current.list).toBeDefined());

        await act(async () => {
            await result.current.updateList({
                sections: [
                    { id: 'S1', type: 'text', heading: 'Intro', headingSize: 2, text: 'Lorem' },
                    {
                        id: 'S2',
                        type: 'list',
                        entries: [{ description: 'A paper', value: { id: 'R7', label: 'Paper', classes: [], _class: 'resource_ref' } }],
                    },
                ],
            });
        });

        await waitFor(() => expect(captured).toHaveLength(1));
        expect(captured[0].body).toEqual({
            sections: [{ heading: 'Intro', heading_size: 2, text: 'Lorem' }, { entries: [{ id: 'R7', description: 'A paper' }] }],
        });
    });
});
