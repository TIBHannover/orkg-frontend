import { render, screen, fireEvent, waitFor } from 'testUtils';
import StatementBrowser from '../StatementBrowser';
import { ENTITIES } from 'constants/graphSettings';
import selectEvent from 'react-select-event';
import { statementBrowserOneProperty } from '../AddValue/__mocks__/StatementBrowserData';
import { ToastContainer } from 'react-toastify';

jest.mock('react-flip-move', () => ({ children }) => children);
jest.mock('components/UserAvatar/UserAvatar', () => () => null);

const setup = (
    initialState = {},
    props = {
        initialSubjectId: 'R1',
        initialSubjectLabel: null,
        newStore: false,
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

describe('AddValue', () => {
    it('should show add value button', async () => {
        const config = {
            initialSubjectId: 'R144078',
            initialSubjectLabel: 'Test',
            newStore: false,
            rootNodeType: ENTITIES.RESOURCE,
            enableEdit: true,
            syncBackend: true
        };
        setup(statementBrowserOneProperty, config);
        const addButton = screen.getByRole('button', { name: 'Add value' });
        await waitFor(() => expect(addButton).toBeInTheDocument());
    });
});

describe('AddValue', () => {
    it('should show add value input form', async () => {
        const config = {
            initialSubjectId: 'R144078',
            initialSubjectLabel: 'Test',
            newStore: false,
            rootNodeType: ENTITIES.RESOURCE,
            enableEdit: true,
            syncBackend: true
        };
        setup(statementBrowserOneProperty, config);
        const addButton = screen.getByRole('button', { name: 'Add value' });
        await waitFor(() => expect(addButton).toBeInTheDocument());
        fireEvent.click(addButton);

        await waitFor(() => expect(screen.getByLabelText(/Enter a resource/i)).toBeInTheDocument());
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
        const createButton = screen.getByRole('button', { name: 'Create' });
        expect(createButton).toBeInTheDocument();
        expect(createButton).toHaveAttribute('disabled');
        const inputs = screen.getAllByRole('textbox');
        expect(inputs).toHaveLength(2);
        inputs.forEach((item, index) => {
            if (index === 0) {
                expect(item).toHaveAttribute('id', 'datatypeSelector');
            }
        });
    });
});

describe('AddValue', () => {
    it('should show hide input form on Cancel', async () => {
        const config = {
            initialSubjectId: 'R144078',
            initialSubjectLabel: 'Test',
            newStore: false,
            rootNodeType: ENTITIES.RESOURCE,
            enableEdit: true,
            syncBackend: true
        };
        setup(statementBrowserOneProperty, config);
        const addButton = screen.getByRole('button', { name: 'Add value' });
        await waitFor(() => expect(addButton).toBeInTheDocument());
        fireEvent.click(addButton);
        expect(() => screen.getByRole('button', { name: 'Add value' })).toThrow();
        const cancelButton = screen.getByRole('button', { name: 'Cancel' });
        fireEvent.click(cancelButton);
        expect(screen.getByRole('button', { name: 'Add value' })).toBeInTheDocument();
    });
});

describe('AddValue', () => {
    it('should show text field on switch to Text datatype', async () => {
        const config = {
            initialSubjectId: 'R144078',
            initialSubjectLabel: 'Test',
            newStore: false,
            rootNodeType: ENTITIES.RESOURCE,
            enableEdit: true,
            syncBackend: true
        };
        setup(statementBrowserOneProperty, config);
        const addButton = screen.getByRole('button', { name: 'Add value' });
        await waitFor(() => expect(addButton).toBeInTheDocument());
        fireEvent.click(addButton);
        await selectEvent.select(screen.getByText('Resource'), ['Text'], { container: document.body });
        expect(screen.getByPlaceholderText(/enter a value/i)).toBeInTheDocument();
    });
});

describe('AddValue', () => {
    it('should show text field on switch to Decimal datatype', async () => {
        const config = {
            initialSubjectId: 'R144078',
            initialSubjectLabel: 'Test',
            newStore: false,
            rootNodeType: ENTITIES.RESOURCE,
            enableEdit: true,
            syncBackend: true
        };
        setup(statementBrowserOneProperty, config);
        const addButton = screen.getByRole('button', { name: 'Add value' });
        await waitFor(() => expect(addButton).toBeInTheDocument());
        fireEvent.click(addButton);
        await selectEvent.select(screen.getByText('Resource'), ['Decimal'], { container: document.body });
        expect(screen.getByPlaceholderText(/enter a value/i)).toBeInTheDocument();
    });
});

describe('AddValue', () => {
    it('should show text field on switch to Integer datatype', async () => {
        const config = {
            initialSubjectId: 'R144078',
            initialSubjectLabel: 'Test',
            newStore: false,
            rootNodeType: ENTITIES.RESOURCE,
            enableEdit: true,
            syncBackend: true
        };
        setup(statementBrowserOneProperty, config);
        const addButton = screen.getByRole('button', { name: 'Add value' });
        await waitFor(() => expect(addButton).toBeInTheDocument());
        fireEvent.click(addButton);
        await selectEvent.select(screen.getByText('Resource'), ['Integer'], { container: document.body });
        expect(screen.getByPlaceholderText(/enter a value/i)).toBeInTheDocument();
    });
});

describe('AddValue', () => {
    it('should show select option field on switch to Boolean datatype', async () => {
        const config = {
            initialSubjectId: 'R144078',
            initialSubjectLabel: 'Test',
            newStore: false,
            rootNodeType: ENTITIES.RESOURCE,
            enableEdit: true,
            syncBackend: true
        };
        setup(statementBrowserOneProperty, config);
        const addButton = screen.getByRole('button', { name: 'Add value' });
        await waitFor(() => expect(addButton).toBeInTheDocument());
        fireEvent.click(addButton);
        await selectEvent.select(screen.getByText('Resource'), ['Boolean'], { container: document.body });
        expect(screen.getByRole('option', { name: 'True' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'False' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'False' }).selected).toBe(true);
        expect(screen.getByRole('button', { name: 'Create' })).not.toBeDisabled();
    });
});

describe('AddValue', () => {
    it('should show date field on switch to Date datatype', async () => {
        const config = {
            initialSubjectId: 'R144078',
            initialSubjectLabel: 'Test',
            newStore: false,
            rootNodeType: ENTITIES.RESOURCE,
            enableEdit: true,
            syncBackend: true
        };
        setup(statementBrowserOneProperty, config);
        const addButton = screen.getByRole('button', { name: 'Add value' });
        await waitFor(() => expect(addButton).toBeInTheDocument());
        fireEvent.click(addButton);
        await selectEvent.select(screen.getByText('Resource'), ['Date'], { container: document.body });
        expect(screen.getByPlaceholderText(/enter a value/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/enter a value/i)).toHaveAttribute('type', 'date');
    });
});

describe('AddValue', () => {
    it('should show text field on switch to URL datatype', async () => {
        const config = {
            initialSubjectId: 'R144078',
            initialSubjectLabel: 'Test',
            newStore: false,
            rootNodeType: ENTITIES.RESOURCE,
            enableEdit: true,
            syncBackend: true
        };
        setup(statementBrowserOneProperty, config);
        const addButton = screen.getByRole('button', { name: 'Add value' });
        await waitFor(() => expect(addButton).toBeInTheDocument());
        fireEvent.click(addButton);
        await selectEvent.select(screen.getByText('Resource'), ['URL'], { container: document.body });
        expect(screen.getByPlaceholderText(/enter a value/i)).toBeInTheDocument();
    });
});
