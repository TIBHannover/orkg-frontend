import { render, screen, fireEvent, waitFor } from 'testUtils';
import StatementBrowser from '../StatementBrowser';
import { ENTITIES } from 'constants/graphSettings';
import { statementBrowserOneProperty } from '../AddValue/__mocks__/StatementBrowserData';
import { ToastContainer } from 'react-toastify';
import selectEvent from 'react-select-event';

jest.mock('react-flip-move', () => ({ children }) => children);
jest.mock('components/UserAvatar/UserAvatar', () => () => null);

const setup = (
    initialState = statementBrowserOneProperty,
    props = {
        initialSubjectId: 'R144078',
        initialSubjectLabel: 'Test',
        newStore: false,
        rootNodeType: ENTITIES.RESOURCE,
        enableEdit: true,
        syncBackend: false
    }
) => {
    render(
        <>
            <StatementBrowser {...props} /> <ToastContainer position="top-right" autoClose={5000} hideProgressBar className="toast-container" />
        </>,
        { initialState }
    );
};

const setValueAndClickOnCreate = async (screen, datatype = 'Resource', value = 'test') => {
    const addButton = screen.getByRole('button', { name: 'Add value' });
    await waitFor(() => expect(addButton).toBeInTheDocument());
    fireEvent.click(addButton);
    await waitFor(() => expect(screen.getByLabelText(/Enter a resource/i)).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/Enter a resource/i), { target: { value } });
    await selectEvent.select(screen.getByText('Resource'), [datatype], { container: document.body });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
};

describe('AddValue', () => {
    it('should validate Decimal datatype', async () => {
        setup();
        await setValueAndClickOnCreate(screen, 'Decimal');
        await waitFor(() => expect(screen.getByText(/must be a number/i)).toBeInTheDocument());
    });
});

describe('AddValue', () => {
    it('should validate Integer datatype', async () => {
        setup();
        await setValueAndClickOnCreate(screen, 'Integer');
        await waitFor(() => expect(screen.getByText(/must be a number/i)).toBeInTheDocument());
    });
});

describe('AddValue', () => {
    it('should not accept Integer datatype when the value is decimal', async () => {
        setup();
        await setValueAndClickOnCreate(screen, 'Integer', '1.5');
        await waitFor(() => expect(screen.getByText(/must be an integer/i)).toBeInTheDocument());
    });
});

describe('AddValue', () => {
    it('should validate Date datatype', async () => {
        setup();
        await setValueAndClickOnCreate(screen, 'Date');
        await waitFor(() => expect(screen.getByText(/must be in ISO 8601 date format/i)).toBeInTheDocument());
    });
});

describe('AddValue', () => {
    it('should validate URL datatype', async () => {
        setup();
        await setValueAndClickOnCreate(screen, 'URL');
        await waitFor(() => expect(screen.getByText(/must be a valid URL/i)).toBeInTheDocument());
    });
});
