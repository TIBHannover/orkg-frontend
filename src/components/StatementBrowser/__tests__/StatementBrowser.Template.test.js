import { render, screen, waitFor, fireEvent, waitForElementToBeRemoved } from 'testUtils';
import StatementBrowser from '../StatementBrowser';
import { ENTITIES } from 'constants/graphSettings';
import { ToastContainer } from 'react-toastify';

jest.mock('react-flip-move', () => ({ children }) => children);
jest.mock('components/UserAvatar/UserAvatar', () => () => null);

const setup = (
    initialState = {},
    props = {
        initialSubjectId: 'R144080',
        initialSubjectLabel: 'Test',
        newStore: true,
        rootNodeType: ENTITIES.RESOURCE,
        enableEdit: true,
        syncBackend: true
    }
) => {
    render(
        <>
            <StatementBrowser {...props} /> <ToastContainer position="top-right" autoClose={5000} hideProgressBar className="toast-container" />
        </>,
        { initialState }
    );
};

describe('StatementBrowser', () => {
    it('should load template of a resource and add required properties', async () => {
        setup();
        await waitFor(() => expect(screen.queryByText(/Loading/i)).toBeInTheDocument());
        await waitForElementToBeRemoved(() => screen.queryByText(/Loading/i));
        await waitFor(() => expect(screen.getByText(/Basic reproduction number/i)).toBeInTheDocument());
        expect(screen.getByText(/Location/i)).toBeInTheDocument();
        expect(screen.getByText(/Time period/i)).toBeInTheDocument();
    });
});

describe('AddValue', () => {
    it('should add blank node', async () => {
        setup();
        await waitFor(() => expect(screen.queryByText(/Loading/i)).toBeInTheDocument());
        await waitForElementToBeRemoved(() => screen.queryByText(/Loading/i));
        await waitFor(() => expect(screen.getByText(/Basic reproduction number/i)).toBeInTheDocument());
        // Basic reproduction number
        await waitFor(() => expect(screen.getByTestId('add-value-P23140-true')).toBeInTheDocument());
        fireEvent.click(screen.getByTestId('add-value-P23140-true'));
        await waitFor(() => expect(screen.getByText(/has value/i)).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText(/Confidence interval/i)).toBeInTheDocument());
    });
});
