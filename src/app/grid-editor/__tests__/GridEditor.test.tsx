import { type OnUrlUpdateFunction } from 'nuqs/adapters/testing';
import { vi } from 'vitest';

import MainGrid from '@/app/grid-editor/components/MainGrid/MainGrid';
import GridProvider from '@/app/grid-editor/context/GridContext';
import { createMSWLiteral, createMSWStatement } from '@/services/mocks/helpers';
import { fireEvent, render, screen, waitFor, within } from '@/testUtils';

const setup = async ({ resourceIds }: { resourceIds?: string[] } = {}) => {
    const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
    // Use existing seed data to avoid MSW database issues
    createMSWLiteral({ id: 'L1', label: 'test literal' });
    createMSWStatement({
        subject: 'R44727', // Use existing resource from seed
        predicate: 'P32', // Use existing predicate from seed
        object: 'L1',
    });
    await render(
        <GridProvider>
            <MainGrid />
        </GridProvider>,
        {
            nuqsOptions: { searchParams: `?entityIds=${resourceIds?.join(',')}`, onUrlUpdate },
        },
    );
    if (resourceIds?.length) {
        await waitFor(() => expect(screen.queryByText(/add property/i)).toBeInTheDocument());
    }
};

describe('GridEditor.LoadResource', () => {
    it('should not crash when no resource data is provided', async () => {
        await setup({ resourceIds: [] });
        await waitFor(() => expect(screen.getByText(/Start adding entities by clicking the button/i)).toBeInTheDocument());
    });

    it('should render when resource data is provided', async () => {
        await setup({ resourceIds: ['R44727'] });

        await waitFor(() => expect(screen.getByText('test literal')).toBeInTheDocument());
        expect(screen.getByRole('button', { name: 'Contribution 1' })).toBeInTheDocument();
        expect(screen.getAllByRole('link', { name: 'research problem' })[0]).toBeInTheDocument();
    });
});

describe('GridEditor.Literals', () => {
    it('should update grid when literal is updated', async () => {
        await setup({ resourceIds: ['R44727'] });
        await waitFor(() => expect(screen.getByRole('gridcell', { name: /test literal/i })).toBeInTheDocument());
        const cell = screen.getByRole('gridcell', { name: /test literal/i });

        // Click the edit button in the cell menu
        fireEvent.click(within(cell).getByRole('button', { name: /open cell menu/i }));
        await waitFor(() => expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument());
        fireEvent.click(screen.getByRole('button', { name: /edit/i }));

        // Verify the cell editor opens with the correct placeholder text
        await waitFor(() => expect(screen.getByPlaceholderText(/enter a Text/i)).toBeInTheDocument());
        const input = screen.getByPlaceholderText(/enter a Text/i);
        expect(input).toHaveValue('test literal');
        await fireEvent.change(input, { target: { value: 'updated literal' } });
        await fireEvent.click(screen.getByRole('button', { name: 'Save' }));
        await waitFor(() => expect(screen.getByText(/updated literal/i)).toBeInTheDocument());
    });
});

describe('literals', () => {
    it('should update grid when literal is removed', async () => {
        await setup({ resourceIds: ['R44727'] });
        await waitFor(() => expect(screen.getByRole('gridcell', { name: /test literal/i })).toBeInTheDocument());
        const cell = screen.getByRole('gridcell', { name: /test literal/i });
        // Click the delete button in the cell menu
        fireEvent.click(within(cell).getByRole('button', { name: /open cell menu/i }));
        await waitFor(() => expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument());
        fireEvent.click(screen.getByRole('button', { name: /delete/i }));

        // confirm deletion
        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
        await fireEvent.click(within(dialog).getByRole('button', { name: /delete/i }));
        await waitFor(() => expect(screen.queryByRole('gridcell', { name: /test literal/i })).not.toBeInTheDocument());
        expect(screen.queryByRole('gridcell', { name: /test literal/i })).not.toBeInTheDocument();
    });
});
