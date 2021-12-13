import { render, screen, waitFor, fireEvent, waitForElementToBeRemoved } from 'testUtils';
import StatementBrowser from '../StatementBrowser';
import { ENTITIES } from 'constants/graphSettings';
import selectEvent from 'react-select-event';

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
    render(<StatementBrowser {...props} />, { initialState });
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

describe('AddValue', () => {
    it('should disable add value after adding a value on the property that require only one value', async () => {
        setup();
        await waitFor(() => expect(screen.queryByText(/Loading/i)).toBeInTheDocument());
        await waitForElementToBeRemoved(() => screen.queryByText(/Loading/i));
        await waitFor(() => expect(screen.getByText(/Basic reproduction number/i)).toBeInTheDocument());
        // Basic reproduction number
        await waitFor(() => expect(screen.getByTestId('add-value-P23140-true')).toBeInTheDocument());
        fireEvent.click(screen.getByTestId('add-value-P23140-true'));
        await waitFor(() => expect(screen.getByText(/has value/i)).toBeInTheDocument());
        fireEvent.click(screen.getByText(/back/i));
        const addR0Value = screen.getByTestId('add-value-P23140-true');
        expect(addR0Value).toBeInTheDocument();
        expect(addR0Value).toBeDisabled();
    });
});

describe('AddValue', () => {
    it('should disable edit property for required properties', async () => {
        setup();
        await waitFor(() => expect(screen.queryByText(/Loading/i)).toBeInTheDocument());
        await waitForElementToBeRemoved(() => screen.queryByText(/Loading/i));
        await waitFor(() => expect(screen.getByText(/Basic reproduction number/i)).toBeInTheDocument());
        // Basic reproduction number
        const changeR0Property = screen.getByTestId('change-property-P23140');
        expect(changeR0Property).toBeInTheDocument();
        expect(changeR0Property).toBeDisabled();
    });
});

describe('AddValue', () => {
    it('should disable delete property for required properties', async () => {
        setup();
        await waitFor(() => expect(screen.queryByText(/Loading/i)).toBeInTheDocument());
        await waitForElementToBeRemoved(() => screen.queryByText(/Loading/i));
        await waitFor(() => expect(screen.getByText(/Basic reproduction number/i)).toBeInTheDocument());
        // Basic reproduction number
        const deleteR0Property = screen.getByTestId('delete-property-P23140');
        expect(deleteR0Property).toBeInTheDocument();
        expect(deleteR0Property).toBeDisabled();
    });
});

describe('AddValue', () => {
    it('should add value of the range specified by the template', async () => {
        setup();
        await waitFor(() => expect(screen.queryByText(/Loading/i)).toBeInTheDocument());
        await waitForElementToBeRemoved(() => screen.queryByText(/Loading/i));
        await waitFor(() => expect(screen.getByText(/Basic reproduction number/i)).toBeInTheDocument());
        // Location
        await waitFor(() => expect(screen.getByTestId('add-value-P5049-false')).toBeInTheDocument());
        fireEvent.click(screen.getByTestId('add-value-P5049-false'));
        fireEvent.change(screen.getByLabelText(/Enter a resource/i), { target: { value: 'Hannover' } });
        await selectEvent.select(screen.getByRole('combobox', { name: /Enter a resource/i, hidden: true }), /Hannover/i);
        await waitFor(() => expect(screen.getByText(/Hannover/i)).toBeInTheDocument());
        // Because location has cardinality 1, the button add should be disabled after adding a new value
        const addLocationValue = screen.getByTestId('add-value-P5049-false');
        expect(addLocationValue).toBeInTheDocument();
        expect(addLocationValue).toBeDisabled();
    });
});
