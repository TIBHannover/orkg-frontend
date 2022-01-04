import { render, screen, waitFor } from 'testUtils';
import AddProperty from '../AddProperty';
import selectEvent from 'react-select-event';
import userEvent from '@testing-library/user-event';
import { statementBrowserStrictTemplate } from '../__mocks__/StatementBrowserDataAddProperty';

jest.mock('react-flip-move', () => ({ children }) => children);

const setup = (
    initialState = {},
    props = {
        resourceId: 'R1',
        syncBackend: false
    }
) => {
    render(<AddProperty {...props} />, { initialState });
};

describe('Add property', () => {
    it('should render add property button', async () => {
        const config = {
            resourceId: 'R1',
            syncBackend: false
        };
        setup({}, config);
        expect(screen.getByRole('button', { name: 'Add property' })).toBeInTheDocument();
    });

    it('should show input form with a cancel button when clicking on add', async () => {
        const config = {
            resourceId: 'R1',
            syncBackend: false
        };
        setup({}, config);
        const addButton = screen.getByRole('button', { name: 'Add property' });
        expect(addButton).toBeInTheDocument();
        userEvent.click(addButton);
        expect(screen.getByLabelText(/Select or type to enter a property/i)).toBeInTheDocument();
        expect(screen.getByRole('combobox')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('should show a disabled button if the template is strict', async () => {
        const config = {
            resourceId: 'R142012',
            syncBackend: false
        };
        setup(statementBrowserStrictTemplate, config);
        const addButton = screen.getByRole('button', { name: 'Add property' });
        expect(addButton).toBeInTheDocument();
        expect(addButton).toHaveAttribute('disabled');
    });

    it('should add existing property', async () => {
        const config = {
            inTemplate: false,
            isDisabled: false,
            resourceId: 'R1',
            syncBackend: false
        };
        setup({}, config);
        const addButton = screen.getByRole('button', { name: 'Add property' });
        userEvent.click(addButton);
        userEvent.type(screen.getByRole('combobox'), 'property label 1');
        await selectEvent.select(screen.getByRole('combobox'), 'property label 1');
        expect(screen.getByRole('button', { name: 'Add property' })).toBeInTheDocument();
    });

    it('should create new property', async () => {
        const config = {
            inTemplate: false,
            isDisabled: false,
            resourceId: 'R1',
            syncBackend: false
        };
        setup({}, config);
        userEvent.click(screen.getByRole('button', { name: 'Add property' }));
        userEvent.type(screen.getByRole('combobox'), 'test property');
        //Warning: You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one.
        selectEvent.create(screen.getByRole('combobox'), 'test property');
        await waitFor(() => expect(screen.getByText(/Often there are existing properties that you can use as well/i)).toBeInTheDocument());
    });
    /*  */
});
