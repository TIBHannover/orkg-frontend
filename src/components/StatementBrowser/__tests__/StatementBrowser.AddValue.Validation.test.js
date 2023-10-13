import { render, screen, fireEvent, waitFor, waitForElementToBeRemoved } from 'testUtils';
import { ENTITIES } from 'constants/graphSettings';
import selectEvent from 'react-select-event';
import StatementBrowser from 'components/StatementBrowser/StatementBrowser';
import { statementBrowserOneProperty } from 'components/StatementBrowser/AddValue/__mocks__/StatementBrowserDataAddValue';

jest.mock(
    'react-flip-move',
    () =>
        ({ children }) =>
            children,
);
jest.mock('components/UserAvatar/UserAvatar', () => () => null);

const setup = (
    initialState = statementBrowserOneProperty,
    props = {
        initialSubjectId: 'R144078',
        initialSubjectLabel: 'Test',
        newStore: false,
        rootNodeType: ENTITIES.RESOURCE,
        enableEdit: true,
        syncBackend: false,
    },
) => {
    render(<StatementBrowser {...props} />, { initialState });
};

const setValueAndClickOnCreate = async (sc, datatype = 'Resource', value = 'test') => {
    const addButton = sc.getByRole('button', { name: 'Add value' });
    await waitFor(() => expect(addButton).toBeInTheDocument());
    fireEvent.click(addButton);
    await waitFor(() => expect(sc.getByLabelText(/Enter a resource/i)).toBeInTheDocument());
    fireEvent.change(sc.getByLabelText(/Enter a resource/i), { target: { value } });
    // await waitForElementToBeRemoved(() => screen.queryByText(/Loading/i));
    const selectInput = screen.getByText('Resource');
    await selectEvent.openMenu(selectInput);
    await selectEvent.select(selectInput, [datatype]);
    fireEvent.click(sc.getByRole('button', { name: 'Create' }));
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
