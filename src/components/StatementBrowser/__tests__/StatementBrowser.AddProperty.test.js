import { render, screen, waitFor, waitForElementToBeRemoved } from 'testUtils';
import userEvent from '@testing-library/user-event';
import { ENTITIES } from 'constants/graphSettings';
import selectEvent from 'react-select-event';
import StatementBrowser from '../StatementBrowser';

jest.mock('react-flip-move', () => ({ children }) => children);
jest.mock('components/UserAvatar/UserAvatar', () => () => null);

const setup = (
    initialState = {},
    props = {
        initialSubjectId: 'R1',
        initialSubjectLabel: null,
        newStore: true,
        rootNodeType: ENTITIES.RESOURCE,
        enableEdit: true,
    },
) => render(<StatementBrowser {...props} />, { initialState });

// syncBackend = false

describe('AddProperty', () => {
    it('should show newly added property', async () => {
        setup({});
        await waitFor(() => expect(screen.queryByText(/Add property/i)).toBeInTheDocument());
        const addButton = screen.getByRole('button', { name: 'Add property' });
        await userEvent.click(addButton);
        await userEvent.type(screen.getByRole('combobox'), 'Property label 1');
        await waitForElementToBeRemoved(() => screen.queryAllByText(/Loading/i));
        await selectEvent.openMenu(screen.getByRole('combobox'));
        await selectEvent.select(screen.getByRole('combobox'), 'property label 1');
        expect(screen.getByRole('button', { name: 'Add property' })).toBeInTheDocument();
        await waitFor(() => expect(screen.getByRole('link', { name: 'property label 1' })).toBeInTheDocument());
    });

    it('should show toast when creating an existing property', async () => {
        setup({});
        // Add the first property ('Property 1')
        const addButton = screen.getByRole('button', { name: 'Add property' });
        await userEvent.click(addButton);
        await userEvent.type(screen.getByRole('combobox'), 'property 1');
        await waitForElementToBeRemoved(() => screen.queryAllByText(/Loading/i));
        await selectEvent.select(screen.getByRole('combobox'), /property 1/i);
        expect(screen.getByRole('button', { name: 'Add property' })).toBeInTheDocument();
        await waitFor(() => expect(screen.getByText('property 1')).toBeInTheDocument());
        // Add the same property ('Property 1')
        const addButton2 = screen.getByRole('button', { name: 'Add property' });
        await userEvent.click(addButton2);
        await userEvent.type(screen.getByRole('combobox'), 'property 1');
        await waitForElementToBeRemoved(() => screen.queryAllByText(/Loading/i));
        await selectEvent.select(screen.getByRole('combobox'), /property 1/i);
        expect(screen.getByRole('button', { name: 'Add property' })).toBeInTheDocument();
        await waitFor(() => expect(screen.getByText(/The property property 1 exists already/i)).toBeInTheDocument());
        await waitFor(() => expect(screen.getAllByText('property 1')).toHaveLength(1));
    });
});

describe('AddProperty no syncBackend', () => {
    it('should show newly created property', async () => {
        setup({});
        await waitFor(() => expect(screen.queryByText(/Add property/i)).toBeInTheDocument());
        const addButton = screen.getByRole('button', { name: 'Add property' });
        await userEvent.click(addButton);
        await userEvent.type(screen.getByRole('combobox'), 'test property');
        await waitForElementToBeRemoved(() => screen.queryAllByText(/Loading/i));
        await selectEvent.openMenu(screen.getByRole('combobox'));
        await selectEvent.select(screen.getByRole('combobox'), /Create/i);
        // await selectEvent.create(screen.getByRole('combobox'), 'test property', { waitForElement: false });
        const createButton = screen.getByRole('button', { name: /Create/i });
        await userEvent.click(createButton);
        await waitFor(() => expect(screen.getByText('test property')).toBeInTheDocument());
    });
});

describe('AddProperty no syncBackend', () => {
    it('should cancel created property', async () => {
        setup();
        await waitFor(() => expect(screen.queryByText(/Add property/i)).toBeInTheDocument());
        await userEvent.click(screen.getByRole('button', { name: 'Add property' }));
        await userEvent.type(screen.getByRole('combobox'), 'test property');
        await waitForElementToBeRemoved(() => screen.queryAllByText(/Loading/i));
        // await selectEvent.openMenu(screen.getByRole('combobox'));
        await selectEvent.create(screen.getByRole('combobox'), 'test property', { waitForElement: false });
        await waitFor(() => expect(screen.getByText(/Often there are existing properties that you can use as well/i)).toBeInTheDocument());
        await userEvent.click(screen.getAllByRole('button', { name: /Cancel/i })[1]);
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
            syncBackend: true,
        };
        setup({}, config);
        await waitFor(() => expect(screen.queryByText(/Add property/i)).toBeInTheDocument());
        await userEvent.click(screen.getByRole('button', { name: 'Add property' }));
        await userEvent.type(screen.getByRole('combobox', { id: 'addProperty' }), 'test property');
        await waitForElementToBeRemoved(() => screen.queryAllByText(/Loading/i));
        selectEvent.create(screen.getByRole('combobox', { id: 'addProperty' }), 'test property', { waitForElement: false });
        await waitFor(() => expect(screen.getByText(/Often there are existing properties that you can use as well/i)).toBeInTheDocument());
        await waitFor(() => expect(screen.getByRole('button', { name: /Create/i })).toBeInTheDocument());
        const createButton = screen.getByRole('button', { name: /Create/i });
        await userEvent.click(createButton);
        await waitFor(() => expect(screen.getByRole('link', { name: 'test property' })).toBeInTheDocument());
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
            syncBackend: true,
        };
        setup({}, config);
        await waitFor(() => expect(screen.queryByText(/Add property/i)).toBeInTheDocument());
        await userEvent.click(screen.getByRole('button', { name: 'Add property' }));
        await userEvent.type(screen.getByRole('combobox', { id: 'addProperty' }), 'test property');
        await waitForElementToBeRemoved(() => screen.queryAllByText(/Loading/i));
        await selectEvent.create(screen.getByRole('combobox'), 'test property', { waitForElement: false });
        await waitFor(() => expect(screen.getByText(/Often there are existing properties that you can use as well/i)).toBeInTheDocument());
        await userEvent.click(screen.getAllByRole('button', { name: /Cancel/i })[1]);
        await waitFor(() => expect(screen.getByRole('button', { name: 'Add property' })).toBeInTheDocument());
    });
});
