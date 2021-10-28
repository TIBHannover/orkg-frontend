import { render, screen, fireEvent, waitFor, waitForElementToBeRemoved } from 'testUtils';
import AddProperty from '../AddProperty';
import { statementBrowserStrictTemplate } from '../__mocks__/StatementBrowserData';

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
    test('should render add property button', async () => {
        const config = {
            resourceId: 'R1',
            syncBackend: false
        };
        setup({}, config);
        expect(screen.getByRole('button', { name: 'Add property' })).toBeInTheDocument();
    });

    test('should show input form with a cancel button when clicking on add', async () => {
        const config = {
            resourceId: 'R1',
            syncBackend: false
        };
        setup({}, config);
        const addButton = screen.getByRole('button', { name: 'Add property' });
        expect(addButton).toBeInTheDocument();
        fireEvent.click(addButton);
        expect(screen.getByLabelText(/Select or type to enter a property/i)).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    test('should show a disabled button if the template is strict', async () => {
        const config = {
            resourceId: 'R142012',
            syncBackend: false
        };
        setup(statementBrowserStrictTemplate, config);
        const addButton = screen.getByRole('button', { name: 'Add property' });
        expect(addButton).toBeInTheDocument();
        expect(addButton).toHaveAttribute('disabled');
    });

    test('should add existing property', async () => {
        const config = {
            inTemplate: false,
            isDisabled: false,
            resourceId: 'R1',
            syncBackend: false
        };
        setup({}, config);
        const addButton = screen.getByRole('button', { name: 'Add property' });
        fireEvent.click(addButton);
        const input = screen.getByRole('textbox');
        fireEvent.mouseDown(input);
        fireEvent.change(input, { target: { value: 'property label 1' } });
        expect(screen.queryByText(/Loading/i)).toBeInTheDocument();
        await waitForElementToBeRemoved(() => screen.queryByText(/Loading.../i));
        fireEvent.click(screen.getAllByText('property label 1')[1]);
        expect(screen.getByRole('button', { name: 'Add property' })).toBeInTheDocument();
        // TODO : Check if the property added to the statement browser
    });

    test('should create new property', async () => {
        const config = {
            inTemplate: false,
            isDisabled: false,
            resourceId: 'R1',
            syncBackend: false
        };
        setup({}, config);
        const addButton = screen.getByRole('button', { name: 'Add property' });
        fireEvent.click(addButton);
        const input = screen.getByRole('textbox');
        fireEvent.mouseDown(input);
        fireEvent.change(input, { target: { value: 'test property' } });
        expect(screen.queryByText(/Loading/i)).toBeInTheDocument();
        await waitForElementToBeRemoved(() => screen.queryByText(/Loading.../i));
        await waitFor(() => screen.getAllByText(/Create "test property"/i));
        fireEvent.click(screen.getAllByText(/Create "test property"/i)[1]);
        expect(screen.queryByText(/Create new property/i)).toBeInTheDocument();
        // TODO : Check if the property added to the statement browser
    });
});
