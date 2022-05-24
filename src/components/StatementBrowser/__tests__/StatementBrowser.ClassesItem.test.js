import { render, screen, waitFor, fireEvent, waitForElementToBeRemoved } from 'testUtils';
import { ENTITIES } from 'constants/graphSettings';
import selectEvent from 'react-select-event';
import StatementBrowser from '../StatementBrowser';

jest.mock('react-flip-move', () => ({ children }) => children);
jest.mock('components/UserAvatar/UserAvatar', () => () => null);

const setup = (
    initialState = {},
    props = {
        initialSubjectId: 'R1',
        initialSubjectLabel: 'Test',
        newStore: true,
        rootNodeType: ENTITIES.RESOURCE,
        enableEdit: true,
        syncBackend: true,
    },
) => {
    render(<StatementBrowser {...props} />, { initialState });
};

describe('ClassesItem', () => {
    it('should show classes when the preference is activated', async () => {
        setup();
        await waitForElementToBeRemoved(() => screen.queryByText(/Loading/i));
        fireEvent.click(screen.getByText('Preferences'));
        await waitFor(() => expect(screen.getByText(/Show classes of resources/i)).toBeInTheDocument());
        fireEvent.click(screen.getByText(/Show classes of resources/i));
        await waitFor(() => expect(screen.getByText(/Instance of/i)).toBeInTheDocument());
    });
});

describe('ClassesItem', () => {
    it('should show edit classes input form when the clicking on edit', async () => {
        setup();
        await waitForElementToBeRemoved(() => screen.queryByText(/Loading/i));
        fireEvent.click(screen.getByText('Preferences'));
        await waitFor(() => expect(screen.getByText(/Show classes of resources/i)).toBeInTheDocument());
        fireEvent.click(screen.getByText(/Show classes of resources/i));
        await waitFor(() => expect(screen.getByText(/Instance of/i)).toBeInTheDocument());
        fireEvent.click(screen.getByRole('button', { name: 'Edit classes' }));
        await waitFor(() => expect(screen.getByLabelText(/Specify the classes of the resource/i)).toBeInTheDocument());
        const saveButton = screen.getByRole('button', { name: 'Done' });
        expect(saveButton).toBeInTheDocument();
    });
});

describe('ClassesItem', () => {
    it('should show hide classes input form when the clicking on done', async () => {
        setup();
        await waitForElementToBeRemoved(() => screen.queryByText(/Loading/i));
        fireEvent.click(screen.getByText('Preferences'));
        fireEvent.click(screen.getByText(/Show classes of resources/i));
        fireEvent.click(screen.getByRole('button', { name: 'Edit classes' }));
        await waitFor(() => expect(screen.getByLabelText(/Specify the classes of the resource/i)).toBeInTheDocument());
        const saveButton = screen.getByRole('button', { name: 'Done' });
        fireEvent.click(saveButton);
        expect(screen.queryByLabelText(/Specify the classes of the resource/i)).toBeNull();
    });
});

describe('ClassesItem', () => {
    it('should add class and add its required properties', async () => {
        setup();
        await waitForElementToBeRemoved(() => screen.queryByText(/Loading/i));
        fireEvent.click(screen.getByText('Preferences'));
        fireEvent.click(screen.getByText(/Show classes of resources/i));
        fireEvent.click(screen.getByRole('button', { name: 'Edit classes' }));
        await waitFor(() => expect(screen.getByLabelText(/Specify the classes of the resource/i)).toBeInTheDocument());
        // Basic reproduction number estimate
        fireEvent.change(screen.getByLabelText(/Specify the classes of the resource/i), { target: { value: 'R40006' } });
        await selectEvent.select(screen.getByRole('combobox', { name: /Specify the classes of the resource/i }), 'R40006');
        await waitFor(() => screen.getByRole('button', { name: 'Done' }));
        fireEvent.click(screen.getByRole('button', { name: 'Done' }));
        await waitFor(() => expect(screen.getByText(/Basic reproduction number/i)).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText(/Location/i)).toBeInTheDocument());
    });
});
