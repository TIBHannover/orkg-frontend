import DataBrowser from '@/components/DataBrowser/DataBrowser';
import { DataBrowserProps } from '@/components/DataBrowser/types/DataBrowserTypes';
import { createMSWResource, createMSWStatement } from '@/services/mocks/helpers';
import { fireEvent, render, Screen, screen, waitFor } from '@/testUtils';

const setup = async (
    props: DataBrowserProps = {
        id: 'R1',
        isEditMode: true,
    },
) => {
    createMSWResource({
        id: 'R123',
        label: 'Lorem ipsum Resource',
    });
    createMSWStatement({
        subject: 'R1',
        predicate: 'P1',
        object: 'R123',
    });
    render(<DataBrowser {...props} />);
    expect(await screen.findByText(/resource label 1/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByText(/property 1/i)).toHaveLength(2));
};

const clickOnDeleteValueButton = async (sc: Screen) => {
    const deleteButton = sc.getByRole('button', { name: 'Delete statement' });
    await waitFor(() => expect(deleteButton).toBeInTheDocument());
    fireEvent.click(deleteButton);
};

describe('DataBrowser.DeleteActions', () => {
    it('should show confirmation box when clicking on delete value button', async () => {
        await setup();
        await clickOnDeleteValueButton(screen);
        await waitFor(() => expect(screen.getByText(/Are you sure/i)).toBeInTheDocument());
        expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
        expect(screen.getByText(/Lorem ipsum/i)).toBeInTheDocument();
    });
});

describe('DataBrowser.DeleteActions', () => {
    it('should delete value on confirm', async () => {
        await setup();
        expect(screen.queryByText(/Lorem ipsum/i)).toBeInTheDocument();
        await clickOnDeleteValueButton(screen);
        await waitFor(() => expect(screen.getByText(/Are you sure/i)).toBeInTheDocument());
        fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
        await waitFor(() => expect(screen.queryByText(/Lorem ipsum/i)).not.toBeInTheDocument());
    });
});

describe('DataBrowser.DeleteActions', () => {
    it('should cancel delete value on cancel', async () => {
        await setup();
        expect(screen.queryByText(/Lorem ipsum/i)).toBeInTheDocument();
        await clickOnDeleteValueButton(screen);
        await waitFor(() => expect(screen.getByText(/Are you sure/i)).toBeInTheDocument());
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        expect(screen.queryByText(/Lorem ipsum/i)).toBeInTheDocument();
    });
});
