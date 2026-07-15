import { type OnUrlUpdateFunction } from 'nuqs/adapters/testing';
import { ReactElement } from 'react';
import { vi } from 'vitest';

import DataBrowser from '@/components/DataBrowser/DataBrowser';
import DataBrowserDialog from '@/components/DataBrowser/DataBrowserDialog';
import { createMSWPredicate, createMSWResource, createMSWStatement } from '@/services/mocks/helpers';
import { fireEvent, render, screen, waitFor } from '@/testUtils';

const PARENT_ID = 'RHistoryParent';
const CHILD_ID = 'RHistoryChild';
const PREDICATE_ID = 'PHistoryLink';

const setup = async (ui: ReactElement, searchParams = '?') => {
    const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
    createMSWResource({ id: PARENT_ID, label: 'parent resource' });
    createMSWResource({ id: CHILD_ID, label: 'child resource' });
    createMSWPredicate({ id: PREDICATE_ID, label: 'linked via' });
    createMSWStatement({ subject: PARENT_ID, predicate: PREDICATE_ID, object: CHILD_ID });
    render(ui, { nuqsOptions: { searchParams, onUrlUpdate } });
    await waitFor(() => expect(screen.getByRole('link', { name: /child resource/i })).toBeInTheDocument());
    return { onUrlUpdate };
};

const historyUrlWrites = (onUrlUpdate: ReturnType<typeof vi.fn<OnUrlUpdateFunction>>) =>
    onUrlUpdate.mock.calls.filter(([event]) => event.searchParams.has('history'));

describe('DataBrowser.HistoryStorage', () => {
    it('should navigate without writing the URL when historyStorage is local', async () => {
        const { onUrlUpdate } = await setup(<DataBrowser id={PARENT_ID} historyStorage="local" />);
        fireEvent.click(screen.getByRole('link', { name: /child resource/i }));
        await waitFor(() => expect(screen.getByRole('link', { name: /back/i })).toBeInTheDocument());
        expect(historyUrlWrites(onUrlUpdate)).toHaveLength(0);
    });

    it('should write an unscoped history entry to the URL by default (embedded browser)', async () => {
        const { onUrlUpdate } = await setup(<DataBrowser id={PARENT_ID} />);
        fireEvent.click(screen.getByRole('link', { name: /child resource/i }));
        await waitFor(() => expect(screen.getByRole('link', { name: /back/i })).toBeInTheDocument());
        const writes = historyUrlWrites(onUrlUpdate);
        expect(writes.length).toBeGreaterThan(0);
        const [lastEvent] = writes[writes.length - 1];
        expect(JSON.parse(lastEvent.searchParams.get('history')!)).toEqual([{ p: [PARENT_ID, PREDICATE_ID, CHILD_ID] }]);
    });

    it('should default to local history in DataBrowserDialog', async () => {
        const { onUrlUpdate } = await setup(<DataBrowserDialog show toggleModal={() => {}} id={PARENT_ID} />);
        fireEvent.click(screen.getByRole('link', { name: /child resource/i }));
        await waitFor(() => expect(screen.getByRole('link', { name: /back/i })).toBeInTheDocument());
        expect(historyUrlWrites(onUrlUpdate)).toHaveLength(0);
    });

    it('should render at the root when the ?history= param is not valid JSON', async () => {
        await setup(<DataBrowser id={PARENT_ID} />, '?history=not-json');
        expect(screen.getByRole('heading', { name: /data browser/i })).toBeInTheDocument();
    });

    it('should drop only the invalid ?history= entry and restore the valid one', async () => {
        const malformed = encodeURIComponent(JSON.stringify([{ p: 'not-an-array' }, { p: [PARENT_ID, PREDICATE_ID, CHILD_ID] }]));
        const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
        createMSWResource({ id: PARENT_ID, label: 'parent resource' });
        createMSWResource({ id: CHILD_ID, label: 'child resource' });
        createMSWPredicate({ id: PREDICATE_ID, label: 'linked via' });
        createMSWStatement({ subject: PARENT_ID, predicate: PREDICATE_ID, object: CHILD_ID });
        render(<DataBrowser id={PARENT_ID} />, { nuqsOptions: { searchParams: `?history=${malformed}`, onUrlUpdate } });
        // the surviving valid entry restores the browser at depth: breadcrumbs + Back are visible
        await waitFor(() => expect(screen.getByRole('link', { name: /back/i })).toBeInTheDocument());
    });

    it('should point local-mode links at the entity page and navigate back without touching the URL', async () => {
        const { onUrlUpdate } = await setup(<DataBrowser id={PARENT_ID} historyStorage="local" />);
        expect(screen.getByRole('link', { name: /child resource/i })).toHaveAttribute('href', expect.stringContaining(`/resources/${CHILD_ID}`));
        fireEvent.click(screen.getByRole('link', { name: /child resource/i }));
        await waitFor(() => expect(screen.getByRole('link', { name: /back/i })).toBeInTheDocument());
        fireEvent.click(screen.getByRole('link', { name: /back/i }));
        await waitFor(() => expect(screen.getByRole('heading', { name: /data browser/i })).toBeInTheDocument());
        expect(historyUrlWrites(onUrlUpdate)).toHaveLength(0);
    });
});
