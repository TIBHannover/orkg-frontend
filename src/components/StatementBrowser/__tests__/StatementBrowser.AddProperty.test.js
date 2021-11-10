import { render, screen, fireEvent, waitFor, waitForElementToBeRemoved } from 'testUtils';
import StatementBrowser from '../StatementBrowser';
import { ENTITIES } from 'constants/graphSettings';
import selectEvent from 'react-select-event';

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
    render(<StatementBrowser {...props} />, { initialState });
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
});

describe('AddProperty no syncBackend', () => {
    it('should show newly created property', async () => {
        setup({});
        const addButton = screen.getByRole('button', { name: 'Add property' });
        fireEvent.click(addButton);
        expect(screen.getByRole('textbox', { id: 'addProperty' }));
        await selectEvent.create(screen.getByRole('textbox', { id: 'addProperty' }), 'test property');
        expect(screen.queryByText(/Loading/i)).toBeInTheDocument();
        expect(screen.queryByText(/Create new property/i)).toBeInTheDocument();
        const createButton = screen.getByRole('button', { name: /Create new property/i });
        fireEvent.click(createButton);
        await waitForElementToBeRemoved(() => screen.queryByText(/Loading/i));
        await waitFor(() => expect(screen.getByText('Test property')).toBeInTheDocument());
    });
});

describe('AddProperty syncBackend', () => {
    it('should cancel created property', async () => {
        setup({});
        const addButton = screen.getByRole('button', { name: 'Add property' });
        fireEvent.click(addButton);
        expect(screen.getByRole('textbox', { id: 'addProperty' }));
        await selectEvent.create(screen.getByRole('textbox', { id: 'addProperty' }), 'test property');
        expect(screen.queryByText(/Loading/i)).toBeInTheDocument();
        const cancelButton = screen.getAllByRole('button', { name: /Cancel/i })[1];
        fireEvent.click(cancelButton);
        await waitForElementToBeRemoved(() => screen.queryByText(/Loading/i));
        expect(() => screen.getByText('Test property')).toThrow();
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
        expect(screen.queryByText(/Loading/i)).toBeInTheDocument();
        const createButton = screen.getByRole('button', { name: /Create new property/i });
        fireEvent.click(createButton);
        await waitForElementToBeRemoved(() => screen.queryByText(/Loading/i));
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
        expect(screen.queryByText(/Loading/i)).toBeInTheDocument();
        const cancelButton = screen.getAllByRole('button', { name: /Cancel/i })[1];
        fireEvent.click(cancelButton);
        await waitForElementToBeRemoved(() => screen.queryByText(/Loading/i));
        expect(() => screen.getByRole('link', { name: 'Test property' })).toThrow();
    });
});
