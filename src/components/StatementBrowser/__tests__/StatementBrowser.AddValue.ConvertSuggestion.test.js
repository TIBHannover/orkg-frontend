import { render, screen, fireEvent, waitFor } from 'testUtils';
import StatementBrowser from '../StatementBrowser';
import { ENTITIES } from 'constants/graphSettings';
import { statementBrowserOneProperty } from '../AddValue/__mocks__/StatementBrowserDataAddValue';

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
    render(<StatementBrowser {...props} />, { initialState });
};

const clickOnAddButton = async screen => {
    const addButton = screen.getByRole('button', { name: 'Add value' });
    await waitFor(() => expect(addButton).toBeInTheDocument());
    fireEvent.click(addButton);
    await waitFor(() => expect(screen.getByLabelText(/Enter a resource/i)).toBeInTheDocument());
};

describe('AddValue', () => {
    it('should show Keep and Convert buttons when suggesting conversion', async () => {
        setup();
        await clickOnAddButton(screen);
        fireEvent.change(screen.getByLabelText(/Enter a resource/i), { target: { value: 'true' } });
        const createButton = screen.getByRole('button', { name: 'Create' });
        fireEvent.click(createButton);
        await waitFor(() => expect(screen.getByText(/The value you entered looks like/i)).toBeInTheDocument());
        expect(screen.getByRole('button', { name: 'Convert' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Keep' })).toBeInTheDocument();
    });
});

describe('AddValue', () => {
    it('should show suggest Boolean type if the value is boolean when Resource is selected', async () => {
        setup();
        await clickOnAddButton(screen);
        fireEvent.change(screen.getByLabelText(/Enter a resource/i), { target: { value: 'true' } });
        const createButton = screen.getByRole('button', { name: 'Create' });
        fireEvent.click(createButton);
        await waitFor(() => expect(screen.getByText(/Boolean/i)).toBeInTheDocument());
    });
});

describe('AddValue', () => {
    it('should show suggest Integer type if the value is integer when Resource is selected', async () => {
        setup();
        await clickOnAddButton(screen);
        fireEvent.change(screen.getByLabelText(/Enter a resource/i), { target: { value: '1' } });
        const createButton = screen.getByRole('button', { name: 'Create' });
        fireEvent.click(createButton);
        await waitFor(() => expect(screen.getByText(/Integer/i)).toBeInTheDocument());
    });
});

describe('AddValue', () => {
    it('should show suggest Decimal type if the value is decimal when Resource is selected', async () => {
        setup();
        await clickOnAddButton(screen);
        fireEvent.change(screen.getByLabelText(/Enter a resource/i), { target: { value: '1.5' } });
        const createButton = screen.getByRole('button', { name: 'Create' });
        fireEvent.click(createButton);
        await waitFor(() => expect(screen.getByText(/Decimal/i)).toBeInTheDocument());
    });
});

describe('AddValue', () => {
    it('should show suggest Date type if the value is decimal when Resource is selected', async () => {
        setup();
        await clickOnAddButton(screen);
        fireEvent.change(screen.getByLabelText(/Enter a resource/i), { target: { value: '2021-11-10' } });
        const createButton = screen.getByRole('button', { name: 'Create' });
        fireEvent.click(createButton);
        await waitFor(() => expect(screen.getByText(/Date/i)).toBeInTheDocument());
    });
});

describe('AddValue', () => {
    it('should show suggest URL type if the value is url when Resource is selected', async () => {
        setup();
        await clickOnAddButton(screen);
        fireEvent.change(screen.getByLabelText(/Enter a resource/i), { target: { value: 'https://www.orkg.org/' } });
        const createButton = screen.getByRole('button', { name: 'Create' });
        fireEvent.click(createButton);
        await waitFor(() => expect(screen.getByText(/URL/i)).toBeInTheDocument());
    });
});

describe('AddValue', () => {
    it('should convert to suggested datatype when clicking on Convert', async () => {
        setup();
        await clickOnAddButton(screen);
        fireEvent.change(screen.getByLabelText(/Enter a resource/i), { target: { value: 'https://www.orkg.org/' } });
        const createButton = screen.getByRole('button', { name: 'Create' });
        fireEvent.click(createButton);
        await waitFor(() => expect(screen.getByText(/URL/i)).toBeInTheDocument());
        fireEvent.click(screen.getByRole('button', { name: 'Convert' }));
        await waitFor(() => expect(screen.getByText('https://www.orkg.org/')).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText('URL')).toHaveAttribute('title', 'xsd:anyURI'));
    });
});

describe('AddValue', () => {
    it('should keep the selected datatype when clicking on Keep', async () => {
        setup();
        await clickOnAddButton(screen);
        fireEvent.change(screen.getByLabelText(/Enter a resource/i), { target: { value: 'https://www.orkg.org/' } });
        const createButton = screen.getByRole('button', { name: 'Create' });
        fireEvent.click(createButton);
        await waitFor(() => expect(screen.getByText(/URL/i)).toBeInTheDocument());
        fireEvent.click(screen.getByRole('button', { name: 'Keep' }));
        await waitFor(() => expect(screen.getByRole('button', { name: 'https://www.orkg.org/' })).toBeInTheDocument());
    });
});
