import { render, screen, waitFor, waitForElementToBeRemoved } from 'testUtils';
import selectEvent from 'react-select-event';
import userEvent from '@testing-library/user-event';
import AddProperty from '../AddProperty';
import { statementBrowserStrictTemplate } from '../__mocks__/StatementBrowserDataAddProperty';

jest.mock(
    'react-flip-move',
    () =>
        ({ children }) =>
            children,
);

const setup = (
    initialState = {},
    props = {
        resourceId: 'R1',
        syncBackend: false,
    },
) => {
    render(<AddProperty {...props} />, { initialState });
};

describe('Add property', () => {
    it('should render add property button', async () => {
        const config = {
            resourceId: 'R1',
            syncBackend: false,
        };
        setup({}, config);
        expect(screen.getByRole('button', { name: 'Add property' })).toBeInTheDocument();
    });

    it('should show input form with a cancel button when clicking on add', async () => {
        const config = {
            resourceId: 'R1',
            syncBackend: false,
        };
        setup({}, config);
        const addButton = screen.getByRole('button', { name: 'Add property' });
        expect(addButton).toBeInTheDocument();
        await userEvent.click(addButton);
        expect(screen.getByLabelText(/Select or type to enter a property/i)).toBeInTheDocument();
        expect(screen.getByRole('combobox')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('should show a disabled button if the template is strict', async () => {
        const config = {
            resourceId: 'R142012',
            syncBackend: false,
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
            syncBackend: false,
        };
        setup({}, config);
        const addButton = screen.getByRole('button', { name: 'Add property' });
        await userEvent.click(addButton);
        await userEvent.type(screen.getByRole('combobox'), 'property label 1');
        // await waitForElementToBeRemoved(() => screen.queryAllByText(/Loading/i));
        await selectEvent.select(screen.getByRole('combobox'), 'property label 1');
        expect(screen.getByRole('button', { name: 'Add property' })).toBeInTheDocument();
    });

    it('should create new property', async () => {
        const config = {
            inTemplate: false,
            isDisabled: false,
            resourceId: 'R1',
            syncBackend: false,
        };
        setup({}, config);
        await userEvent.click(screen.getByRole('button', { name: 'Add property' }));
        await userEvent.type(screen.getByRole('combobox'), 'test property');
        // await waitForElementToBeRemoved(() => screen.queryAllByText(/Loading/i));
        const selectInput = screen.getByRole('combobox');
        await selectEvent.openMenu(selectInput);
        await selectEvent.select(selectInput, /Create/i);
        await waitFor(() => expect(screen.getByText(/Often there are existing properties that you can use as well/i)).toBeInTheDocument());
    });
    /*  */
});
