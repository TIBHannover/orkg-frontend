import selectEvent from 'react-select-event';

import DataBrowser from '@/components/DataBrowser/DataBrowser';
import { DataBrowserProps } from '@/components/DataBrowser/types/DataBrowserTypes';
import { fireEvent, render, screen, waitFor, waitForElementToBeRemoved } from '@/testUtils';

const setup = async (
    props: DataBrowserProps = {
        id: 'R1',
        isEditMode: true,
    },
) => {
    render(<DataBrowser {...props} />);
};

describe('DataBrowser.Classes', () => {
    it('should add class and add its required properties', async () => {
        await setup();
        await waitFor(() => expect(screen.queryByText(/Add property/i)).toBeInTheDocument());
        fireEvent.click(screen.getByRole('button', { name: /Edit classes/i }));
        await waitFor(() => expect(screen.getByLabelText(/Specify the classes of the resource/i)).toBeInTheDocument());
        // Basic reproduction number estimate
        await fireEvent.change(screen.getByLabelText(/Specify the classes of the resource/i), { target: { value: 'R40006' } });
        await waitForElementToBeRemoved(() => screen.queryAllByText(/Loading/i));
        selectEvent.select(screen.getByRole('combobox', { name: /Specify the classes of the resource/i }), 'R40006');
        await waitForElementToBeRemoved(() => screen.queryAllByText(/Syntax/i));
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));
        await waitFor(() => expect(screen.queryAllByText(/Basic reproduction number/i)).toHaveLength(2));
        await waitFor(() => expect(screen.getByText(/Location/i)).toBeInTheDocument());
    });
});
