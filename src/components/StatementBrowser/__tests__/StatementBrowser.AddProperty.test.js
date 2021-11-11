import { render, screen, fireEvent, waitFor, waitForElementToBeRemoved } from 'testUtils';
import StatementBrowser from '../StatementBrowser';
import { ENTITIES } from 'constants/graphSettings';
import selectEvent from 'react-select-event';
import { ToastContainer } from 'react-toastify';

jest.mock('react-flip-move', () => ({ children }) => children);
jest.mock('components/UserAvatar/UserAvatar', () => () => null);

const setup = (
    initialState = {},
    props = {
        initialSubjectId: 'R1',
        initialSubjectLabel: null,
        newStore: true,
        rootNodeType: ENTITIES.RESOURCE,
        enableEdit: true
    }
) => {
    render(
        <>
            <StatementBrowser {...props} /> <ToastContainer position="top-right" autoClose={5000} hideProgressBar className="toast-container" />
        </>,
        { initialState }
    );
};

// syncBackend = false

describe('AddProperty', () => {
    it('should show newly added property', async () => {
        setup({});
        await waitFor(() => expect(screen.queryByText(/Loading/i)).toBeInTheDocument());
        const addButton = screen.getByRole('button', { name: 'Add property' });
        fireEvent.click(addButton);
        const input = screen.getByRole('textbox');
        fireEvent.mouseDown(input);
        fireEvent.change(input, { target: { value: 'property label 1' } });
        await waitForElementToBeRemoved(() => screen.queryByText(/Loading.../i));
        fireEvent.click(screen.getAllByText('property label 1')[1]);
        expect(screen.getByRole('button', { name: 'Add property' })).toBeInTheDocument();
        await waitForElementToBeRemoved(() => screen.queryByText(/Loading/i));
        await waitFor(() => expect(screen.getByRole('link', { name: 'Property label 1' })).toBeInTheDocument());
    });

    it('should show toast when creating an existing property', async () => {
        setup({});
        // Add the first property ('Property 1')
        await waitFor(() => expect(screen.queryByText(/Loading/i)).toBeInTheDocument());
        const addButton = screen.getByRole('button', { name: 'Add property' });
        fireEvent.click(addButton);
        const input = screen.getByRole('textbox');
        fireEvent.mouseDown(input);
        fireEvent.change(input, { target: { value: 'property 1' } });
        await waitForElementToBeRemoved(() => screen.queryByText(/Loading.../i));
        fireEvent.click(screen.getAllByText('property 1')[1]);
        expect(screen.getByRole('button', { name: 'Add property' })).toBeInTheDocument();
        await waitForElementToBeRemoved(() => screen.queryByText(/Loading/i));
        await waitFor(() => expect(screen.getByText('Property 1')).toBeInTheDocument());
        // Add the same property ('Property 1')
        const addButton2 = screen.getByRole('button', { name: 'Add property' });
        fireEvent.click(addButton2);
        const input2 = screen.getByRole('textbox');
        fireEvent.mouseDown(input2);
        fireEvent.change(input2, { target: { value: 'property 1' } });
        await waitForElementToBeRemoved(() => screen.queryByText(/Loading.../i));
        fireEvent.click(screen.getAllByText('property 1')[1]);
        expect(screen.getByRole('button', { name: 'Add property' })).toBeInTheDocument();
        await waitFor(() => expect(screen.getByText(/The property Property 1 exists already!/i)).toBeInTheDocument());
        await waitFor(() => expect(screen.getAllByText('Property 1')).toHaveLength(1));
    });
});

describe('AddProperty no syncBackend', () => {
    it('should show newly created property', async () => {
        setup({});
        const addButton = screen.getByRole('button', { name: 'Add property' });
        fireEvent.click(addButton);
        expect(screen.getByRole('textbox', { id: 'addProperty' }));
        await selectEvent.create(screen.getByRole('textbox', { id: 'addProperty' }), 'test property');
        expect(screen.queryByText(/Create new property/i)).toBeInTheDocument();
        const createButton = screen.getByRole('button', { name: /Create new property/i });
        fireEvent.click(createButton);
        await waitForElementToBeRemoved(() => screen.queryByText(/Loading/i));
        await waitFor(() => expect(screen.getByText('Test property')).toBeInTheDocument());
    });
});

describe('AddProperty no syncBackend', () => {
    it('should cancel created property', async () => {
        setup({});
        const addButton = screen.getByRole('button', { name: 'Add property' });
        fireEvent.click(addButton);
        expect(screen.getByRole('textbox', { id: 'addProperty' }));
        await selectEvent.create(screen.getByRole('textbox', { id: 'addProperty' }), 'test property');
        const cancelButton = screen.getAllByRole('button', { name: /Cancel/i })[1];
        fireEvent.click(cancelButton);
        await waitFor(() => expect(screen.getByRole('button', { name: 'Add property' })).toBeInTheDocument());
    });
});

// syncBackend = true

describe('AddProperty syncBackend', () => {
    it('should show newly created property', async () => {
        const config = {
            initialSubjectId: 'R1',
            initialSubjectLabel: null,
            newStore: true,
            rootNodeType: ENTITIES.RESOURCE,
            enableEdit: true,
            syncBackend: true
        };
        setup({}, config);
        const addButton = screen.getByRole('button', { name: 'Add property' });
        fireEvent.click(addButton);
        expect(screen.getByRole('textbox', { id: 'addProperty' }));
        await selectEvent.create(screen.getByRole('textbox', { id: 'addProperty' }), 'test property');
        const createButton = screen.getByRole('button', { name: /Create new property/i });
        fireEvent.click(createButton);
        await waitFor(() => expect(screen.getByRole('link', { name: 'Test property' })).toBeInTheDocument());
    });
});

describe('AddProperty syncBackend', () => {
    it('should cancel created property', async () => {
        const config = {
            initialSubjectId: 'R1',
            initialSubjectLabel: null,
            newStore: true,
            rootNodeType: ENTITIES.RESOURCE,
            enableEdit: true,
            syncBackend: true
        };
        setup({}, config);
        const addButton = screen.getByRole('button', { name: 'Add property' });
        fireEvent.click(addButton);
        expect(screen.getByRole('textbox', { id: 'addProperty' }));
        await selectEvent.create(screen.getByRole('textbox', { id: 'addProperty' }), 'test property');
        const cancelButton = screen.getAllByRole('button', { name: /Cancel/i })[1];
        fireEvent.click(cancelButton);
        await waitFor(() => expect(screen.getByRole('button', { name: 'Add property' })).toBeInTheDocument());
    });
});
