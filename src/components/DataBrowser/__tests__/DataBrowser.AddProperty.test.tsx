import userEvent from '@testing-library/user-event';
import DataBrowser from 'components/DataBrowser/DataBrowser';
import { DataBrowserProps } from 'components/DataBrowser/types/DataBrowserTypes';
import selectEvent from 'react-select-event';
import { createMSWClass, createMSWResource } from 'services/mocks/helpers';
import { render, screen, waitFor } from 'testUtils';

const setup = (props: DataBrowserProps) => {
    render(<DataBrowser {...props} />);
};

describe('DataBrowser.AddProperty', () => {
    it('should show newly created property', async () => {
        const config = {
            id: 'R1',
            isEditMode: true,
        };
        setup(config);
        await waitFor(() => expect(screen.queryByText(/Add property/i)).toBeInTheDocument());
        await userEvent.click(screen.getByRole('button', { name: 'Add property' }));
        await userEvent.type(screen.getByRole('combobox'), 'test property');
        // await waitForElementToBeRemoved(() => screen.queryAllByText(/Loading/i));
        selectEvent.create(screen.getByRole('combobox'), 'test property', { waitForElement: false });
        await waitFor(() => expect(screen.getByText(/Often there are existing properties that you can use as well/i)).toBeInTheDocument());
        await waitFor(() => expect(screen.getByRole('button', { name: /Create/i })).toBeInTheDocument());
        const createButton = screen.getByRole('button', { name: /Create/i });
        await userEvent.click(createButton);
        await waitFor(() => expect(screen.getByRole('link', { name: 'test property' })).toBeInTheDocument());
    });
});

describe('DataBrowser.AddProperty', () => {
    it('should cancel create new property', async () => {
        const config = {
            id: 'R1',
            isEditMode: true,
        };
        setup(config);
        await waitFor(() => expect(screen.queryByText(/Add property/i)).toBeInTheDocument());
        await userEvent.click(screen.getByRole('button', { name: 'Add property' }));
        await userEvent.type(screen.getByRole('combobox'), 'test property');
        // await waitForElementToBeRemoved(() => screen.queryAllByText(/Loading/i));
        await selectEvent.create(screen.getByRole('combobox'), 'test property', { waitForElement: true });
        await waitFor(() => expect(screen.getByText(/Often there are existing properties that you can use as well/i)).toBeInTheDocument());
        await userEvent.click(screen.getAllByRole('button', { name: /cancel/i })[1]);
        await userEvent.click(screen.getAllByRole('button', { name: /cancel/i })[0]);
        await waitFor(() => expect(screen.getByRole('button', { name: 'Add property' })).toBeInTheDocument());
    });
});

describe('DataBrowser.AddProperty', () => {
    it('should show a disabled button if the template is strict', async () => {
        const config = {
            id: 'RStringTemplate',
            isEditMode: true,
        };

        createMSWClass({
            id: 'StrictTemplateClass',
            label: 'StrictTemplateClass',
        });
        createMSWResource({
            id: config.id,
            classes: ['StrictTemplateClass'],
        });
        await setup(config);
        await waitFor(() => expect(screen.queryByText(/Add property/i)).toBeInTheDocument());
        const addButton = screen.getByRole('button', { name: 'Add property' });
        expect(addButton).toBeInTheDocument();
        expect(addButton).toHaveAttribute('disabled');
    });
});
