import { render, screen, fireEvent, waitFor, waitForElementToBeRemoved } from 'testUtils';
import StatementBrowser from '../StatementBrowser';
import { ENTITIES } from 'constants/graphSettings';
import selectEvent from 'react-select-event';
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
    it('should show add value button', async () => {
        setup();
        const addButton = screen.getByRole('button', { name: 'Add value' });
        await waitFor(() => expect(addButton).toBeInTheDocument());
    });
});

describe('AddValue', () => {
    it('should show add value input form', async () => {
        setup();
        await clickOnAddButton(screen);
        await waitFor(() => expect(screen.getByLabelText(/Enter a resource/i)).toBeInTheDocument());
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
        const createButton = screen.getByRole('button', { name: 'Create' });
        expect(createButton).toBeInTheDocument();
        expect(createButton).toBeDisabled();
        const inputs = screen.getAllByRole('combobox');
        expect(inputs).toHaveLength(2);
        inputs.forEach((item, index) => {
            if (index === 0) {
                expect(item).toHaveAttribute('id', 'datatypeSelector');
            }
        });
    });
});

describe('AddValue', () => {
    it('should hide input form on Cancel', async () => {
        setup();
        await clickOnAddButton(screen);
        expect(() => screen.getByRole('button', { name: 'Add value' })).toThrow();
        const cancelButton = screen.getByRole('button', { name: 'Cancel' });
        fireEvent.click(cancelButton);
        expect(screen.getByRole('button', { name: 'Add value' })).toBeInTheDocument();
    });
});

describe('AddValue', () => {
    it('should show text field on switch to Text datatype', async () => {
        setup();
        await clickOnAddButton(screen);
        await selectEvent.select(screen.getByText('Resource'), ['Text']);
        expect(screen.getByPlaceholderText(/enter a value/i)).toBeInTheDocument();
    });
});

describe('AddValue', () => {
    it('should show text field on switch to Decimal datatype', async () => {
        setup();
        await clickOnAddButton(screen);
        await selectEvent.select(screen.getByText('Resource'), ['Decimal']);
        expect(screen.getByPlaceholderText(/enter a value/i)).toBeInTheDocument();
    });
});

describe('AddValue', () => {
    it('should show text field on switch to Integer datatype', async () => {
        setup();
        await clickOnAddButton(screen);
        await selectEvent.select(screen.getByText('Resource'), ['Integer']);
        expect(screen.getByPlaceholderText(/enter a value/i)).toBeInTheDocument();
    });
});

describe('AddValue', () => {
    it('should show select option field on switch to Boolean datatype', async () => {
        setup();
        await clickOnAddButton(screen);
        await selectEvent.select(screen.getByText('Resource'), ['Boolean']);
        expect(screen.getByRole('option', { name: 'True' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'False' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'False' }).selected).toBe(true);
        expect(screen.getByRole('button', { name: 'Create' })).not.toBeDisabled();
    });
});

describe('AddValue', () => {
    it('should show date field on switch to Date datatype', async () => {
        setup();
        await clickOnAddButton(screen);
        await selectEvent.select(screen.getByText('Resource'), ['Date']);
        expect(screen.getByPlaceholderText(/enter a value/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/enter a value/i)).toHaveAttribute('type', 'date');
    });
});

describe('AddValue', () => {
    it('should show text field on switch to URL datatype', async () => {
        setup();
        await clickOnAddButton(screen);
        await selectEvent.select(screen.getByText('Resource'), ['URL']);
        expect(screen.getByPlaceholderText(/enter a value/i)).toBeInTheDocument();
    });
});

describe('AddValue', () => {
    it('should add resource when selected from the option', async () => {
        setup();
        await clickOnAddButton(screen);
        fireEvent.change(screen.getByLabelText(/Enter a resource/i), { target: { value: 'resource label 1' } });
        await selectEvent.select(screen.getByRole('combobox', { name: /Enter a resource/i }), 'resource label 1');
        await waitForElementToBeRemoved(() => screen.queryByText(/Loading/i));
        await waitFor(() => expect(screen.getByRole('button', { name: 'resource label 1' })).toBeInTheDocument());
        const addButton = screen.getByRole('button', { name: 'Add value' });
        await waitFor(() => expect(addButton).toBeInTheDocument());
    });
});

describe('AddValue', () => {
    it('should create resource when clicking on create button', async () => {
        setup();
        await clickOnAddButton(screen);
        fireEvent.change(screen.getByLabelText(/Enter a resource/i), { target: { value: 'resource label 1' } });
        const createButton = screen.getByRole('button', { name: 'Create' });
        fireEvent.click(createButton);
        await waitFor(() => expect(screen.getByRole('button', { name: 'resource label 1' })).toBeInTheDocument());
        const addButton = screen.getByRole('button', { name: 'Add value' });
        await waitFor(() => expect(addButton).toBeInTheDocument());
    });
});

describe('AddValue', () => {
    it('should create a string literal when choosing Text datatype and clicking on create button', async () => {
        setup();
        await clickOnAddButton(screen);
        await selectEvent.select(screen.getByText('Resource'), ['Text']);
        fireEvent.change(screen.getByPlaceholderText(/enter a value/i), { target: { value: 'Literal 1' } });
        fireEvent.click(screen.getByRole('button', { name: 'Create' }));
        await waitFor(() => expect(screen.getByText('Literal 1')).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText('Text')).toHaveAttribute('title', 'xsd:string'));
    });
});

describe('AddValue', () => {
    it('should create an decimal literal when choosing Decimal datatype and clicking on create button', async () => {
        setup();
        await clickOnAddButton(screen);
        await selectEvent.select(screen.getByText('Resource'), ['Decimal']);
        fireEvent.change(screen.getByPlaceholderText(/enter a value/i), { target: { value: '1.5' } });
        fireEvent.click(screen.getByRole('button', { name: 'Create' }));
        await waitFor(() => expect(screen.getByText('1.5')).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText('Decimal')).toHaveAttribute('title', 'xsd:decimal'));
    });
});

describe('AddValue', () => {
    it('should create an integer literal when choosing Integer datatype and clicking on create button', async () => {
        setup();
        await clickOnAddButton(screen);
        await selectEvent.select(screen.getByText('Resource'), ['Integer']);
        fireEvent.change(screen.getByPlaceholderText(/enter a value/i), { target: { value: '1' } });
        fireEvent.click(screen.getByRole('button', { name: 'Create' }));
        await waitFor(() => expect(screen.getByText('1')).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText('Integer')).toHaveAttribute('title', 'xsd:integer'));
    });
});

describe('AddValue', () => {
    it('should create a false boolean literal when choosing Boolean datatype and clicking on create button', async () => {
        setup();
        await clickOnAddButton(screen);
        await selectEvent.select(screen.getByText('Resource'), ['Boolean']);
        fireEvent.change(screen.getAllByRole('combobox')[1], { target: { value: 'false' } });
        fireEvent.click(screen.getByRole('button', { name: 'Create' }));
        await waitFor(() => expect(screen.getByLabelText('Cross mark')).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText('Boolean')).toHaveAttribute('title', 'xsd:boolean'));
    });
});

describe('AddValue', () => {
    it('should create a true boolean literal when choosing Boolean datatype and clicking on create button', async () => {
        setup();
        await clickOnAddButton(screen);
        await selectEvent.select(screen.getByText('Resource'), ['Boolean']);
        fireEvent.change(screen.getAllByRole('combobox')[1], { target: { value: 'true' } });
        fireEvent.click(screen.getByRole('button', { name: 'Create' }));
        await waitFor(() => expect(screen.getByLabelText('Check mark')).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText('Boolean')).toHaveAttribute('title', 'xsd:boolean'));
    });
});

describe('AddValue', () => {
    it('should create an date literal when choosing Date datatype and clicking on create button', async () => {
        setup();
        await clickOnAddButton(screen);
        await selectEvent.select(screen.getByText('Resource'), ['Date']);
        fireEvent.change(screen.getByPlaceholderText(/enter a value/i), { target: { value: '2021-11-10' } });
        fireEvent.click(screen.getByRole('button', { name: 'Create' }));
        await waitFor(() => expect(screen.getByText('2021-11-10')).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText('Date')).toHaveAttribute('title', 'xsd:date'));
    });
});

describe('AddValue', () => {
    it('should create an uri literal when choosing URL datatype and clicking on create button', async () => {
        setup();
        await clickOnAddButton(screen);
        await selectEvent.select(screen.getByText('Resource'), ['URL']);
        fireEvent.change(screen.getByPlaceholderText(/enter a value/i), { target: { value: 'https://www.orkg.org/' } });
        fireEvent.click(screen.getByRole('button', { name: 'Create' }));
        await waitFor(() => expect(screen.getByText('https://www.orkg.org/')).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText('URL')).toHaveAttribute('title', 'xsd:anyURI'));
    });
});
