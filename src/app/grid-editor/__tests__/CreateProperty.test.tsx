import userEvent from '@testing-library/user-event';
import { type OnUrlUpdateFunction } from 'nuqs/adapters/testing';
import selectEvent from 'react-select-event';
import { vi } from 'vitest';

import MainGrid from '@/app/grid-editor/components/MainGrid/MainGrid';
import GridProvider from '@/app/grid-editor/context/GridContext';
import { fireEvent, render, screen, waitFor } from '@/testUtils';

const setup = async () => {
    const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
    await render(
        <GridProvider>
            <MainGrid />
        </GridProvider>,
        {
            nuqsOptions: { searchParams: '?entityIds=R44727,R44727', onUrlUpdate },
        },
    );
    await waitFor(() => expect(screen.queryByText(/add property/i)).toBeInTheDocument());
};

describe('GridEditor.CreateProperty', () => {
    it('shows "add property" button by default', async () => {
        await setup();
        const button = screen.getByRole('button', { name: /add property/i });
        expect(button).toBeInTheDocument();
    });

    it('shows property autocomplete on click', async () => {
        await setup();
        const button = screen.getByRole('button', { name: /add property/i });
        fireEvent.click(button);

        await waitFor(() => expect(screen.getByRole('combobox')).toBeInTheDocument());
    });

    it('should hide the property autocomplete on blur', async () => {
        await setup();
        const button = screen.getByRole('button', { name: /add property/i });
        fireEvent.click(button);

        await waitFor(() => screen.getByRole('combobox'));
        fireEvent.blur(screen.getByRole('combobox'));
        const cancelButton = screen.getByRole('button', { name: /Cancel/i });
        fireEvent.click(cancelButton);
        expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    });

    it('should show newly created property', async () => {
        await setup();
        await userEvent.click(screen.getByRole('button', { name: 'Add property' }));
        await userEvent.type(screen.getByRole('combobox'), 'test property');
        selectEvent.create(screen.getByRole('combobox'), 'test property', { waitForElement: false });
        await waitFor(() => expect(screen.getByText(/Often there are existing properties that you can use as well/i)).toBeInTheDocument());
        await waitFor(() => expect(screen.getByRole('button', { name: /Create/i })).toBeInTheDocument());
        const createButton = screen.getByRole('button', { name: /Create/i });
        await userEvent.click(createButton);
        await waitFor(() => expect(screen.getByRole('link', { name: 'test property' })).toBeInTheDocument());
    });
});
