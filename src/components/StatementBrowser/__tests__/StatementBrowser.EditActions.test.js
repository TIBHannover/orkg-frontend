import { render, screen, fireEvent, waitFor } from 'testUtils';
import StatementBrowser from '../StatementBrowser';
import { ENTITIES } from 'constants/graphSettings';
import selectEvent from 'react-select-event';
import { statementBrowser1P7V } from '../ValueItem/__mocks__/StatementBrowserDataValueItem';
import { ToastContainer } from 'react-toastify';

jest.mock('react-flip-move', () => ({ children }) => children);
jest.mock('components/UserAvatar/UserAvatar', () => () => null);

const setup = (
    initialState = statementBrowser1P7V,
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

const clickOnEditValueButton = async (screen, valueId) => {
    const editButton = screen.getByTestId(valueId);
    expect(editButton).toBeInTheDocument();
    fireEvent.click(editButton);
    expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
};

const VALUE_IDS = {
    Date: '2c9a364e-86e9-595c-deed-71c7e2b2ad75',
    Integer: '7b5e79ac-26e6-b05a-a99c-2e2e4ef61946',
    Decimal: 'a94f9585-1cb7-e9f5-9539-4cc90e1e0b91',
    Boolean: 'd39d45d1-3e27-3b6a-b2c6-5f5134bad8bd',
    Text: '5b790dfb-82e6-256e-8458-60d78bfa5d37',
    Resource: 'c1aae3c4-4b49-8e5f-7d3f-ba4f8725899b',
    URL: '1cf10225-1ef6-364e-b829-9797abbbc969'
};

describe('ValueItem', () => {
    it('should cancel editing on clicking Cancel', async () => {
        setup();
        await clickOnEditValueButton(screen, VALUE_IDS['Date']);
        expect(screen.queryByText(/Cancel/i)).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        expect(screen.queryByText(/Cancel/i)).toBeNull();
        expect(screen.getByTestId(VALUE_IDS['Date'])).toBeInTheDocument();
    });
});

describe('ValueItem', () => {
    it('should show edit form for date when editing a Date', async () => {
        setup();
        await clickOnEditValueButton(screen, VALUE_IDS['Date']);
        const inputForm = screen.getByPlaceholderText(/enter a value/i);
        expect(inputForm).toHaveAttribute('type', 'date');
        expect(inputForm).toHaveValue('2021-11-12');
    });
});

describe('ValueItem', () => {
    it('should change value of date after editing a Date', async () => {
        setup();
        await clickOnEditValueButton(screen, VALUE_IDS['Date']);
        fireEvent.change(screen.getByPlaceholderText(/enter a value/i), { target: { value: '2018-10-25' } });
        fireEvent.click(screen.getByRole('button', { name: 'Done' }));
        await waitFor(() => expect(screen.getByText('2018-10-25')).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText('Date')).toHaveAttribute('title', 'xsd:date'));
    });
});

describe('ValueItem', () => {
    it('should show edit form for text when editing a Integer', async () => {
        setup();
        await clickOnEditValueButton(screen, VALUE_IDS['Integer']);
        const inputForm = screen.getByPlaceholderText(/enter a value/i);
        expect(inputForm).toBeInTheDocument();
        expect(inputForm).toHaveValue('213');
    });
});

describe('ValueItem', () => {
    it('should change value of integer after editing a Integer', async () => {
        setup();
        await clickOnEditValueButton(screen, VALUE_IDS['Integer']);
        fireEvent.change(screen.getByPlaceholderText(/enter a value/i), { target: { value: '1' } });
        fireEvent.click(screen.getByRole('button', { name: 'Done' }));
        await waitFor(() => expect(screen.getByText('1')).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText('Integer')).toHaveAttribute('title', 'xsd:integer'));
    });
});

describe('ValueItem', () => {
    it('should show edit form for text when editing a Decimal', async () => {
        setup();
        await clickOnEditValueButton(screen, VALUE_IDS['Decimal']);
        const inputForm = screen.getByPlaceholderText(/enter a value/i);
        expect(inputForm).toBeInTheDocument();
        expect(inputForm).toHaveValue('3.14');
    });
});

describe('ValueItem', () => {
    it('should change value of decimal after editing a Decimal', async () => {
        setup();
        await clickOnEditValueButton(screen, VALUE_IDS['Decimal']);
        fireEvent.change(screen.getByPlaceholderText(/enter a value/i), { target: { value: '1.5' } });
        fireEvent.click(screen.getByRole('button', { name: 'Done' }));
        await waitFor(() => expect(screen.getByText('1.5')).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText('Decimal')).toHaveAttribute('title', 'xsd:decimal'));
    });
});

describe('ValueItem', () => {
    it('should show edit form for text when editing a Text', async () => {
        setup();
        await clickOnEditValueButton(screen, VALUE_IDS['Text']);
        const inputForm = screen.getByPlaceholderText(/enter a value/i);
        expect(inputForm).toBeInTheDocument();
        expect(inputForm).toHaveValue('Lorem ipsum');
    });
});

describe('ValueItem', () => {
    it('should change value of text after editing a Text', async () => {
        setup();
        await clickOnEditValueButton(screen, VALUE_IDS['Text']);
        fireEvent.change(screen.getByPlaceholderText(/enter a value/i), { target: { value: 'Literal 1' } });
        fireEvent.click(screen.getByRole('button', { name: 'Done' }));
        await waitFor(() => expect(screen.getByText('Literal 1')).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText('Text')).toHaveAttribute('title', 'xsd:string'));
    });
});

describe('ValueItem', () => {
    it('should show edit form for text when editing a Resource', async () => {
        setup();
        await clickOnEditValueButton(screen, VALUE_IDS['Resource']);
        const inputForm = screen.getByPlaceholderText(/enter a value/i);
        expect(inputForm).toBeInTheDocument();
        expect(inputForm).toHaveValue('Lorem ipsum Resource');
    });
});

describe('ValueItem', () => {
    it('should change value of resource after editing a Resource', async () => {
        setup();
        await clickOnEditValueButton(screen, VALUE_IDS['Resource']);
        fireEvent.change(screen.getByPlaceholderText(/enter a value/i), { target: { value: 'resource label 1' } });
        fireEvent.click(screen.getByRole('button', { name: 'Done' }));
        await waitFor(() => expect(screen.getByRole('button', { name: 'resource label 1' })).toBeInTheDocument());
    });
});

describe('ValueItem', () => {
    it('should show select form when editing a Boolean', async () => {
        setup();
        await clickOnEditValueButton(screen, VALUE_IDS['Boolean']);
        expect(screen.getByRole('combobox')).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'False' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'False' }).selected).toBe(true);
    });
});

describe('ValueItem', () => {
    it('should change value of boolean after editing a Boolean', async () => {
        setup();
        await clickOnEditValueButton(screen, VALUE_IDS['Boolean']);
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'true' } });
        fireEvent.click(screen.getByRole('button', { name: 'Done' }));
        await waitFor(() => expect(screen.getByLabelText('Check mark')).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText('Boolean')).toHaveAttribute('title', 'xsd:boolean'));
    });
});

describe('ValueItem', () => {
    it('should show edit form for text when editing a URL', async () => {
        setup();
        await clickOnEditValueButton(screen, VALUE_IDS['URL']);
        const inputForm = screen.getByPlaceholderText(/enter a value/i);
        expect(inputForm).toBeInTheDocument();
        expect(inputForm).toHaveValue('www.orkg.org');
    });
});

describe('ValueItem', () => {
    it('should change value of url after editing a URL', async () => {
        setup();
        await clickOnEditValueButton(screen, VALUE_IDS['URL']);
        fireEvent.change(screen.getByPlaceholderText(/enter a value/i), { target: { value: 'www.tib.eu' } });
        fireEvent.click(screen.getByRole('button', { name: 'Done' }));
        await waitFor(() => expect(screen.getByText('www.tib.eu')).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText('URL')).toHaveAttribute('title', 'xsd:anyURI'));
    });
});

describe('ValueItem', () => {
    it('should change type of value after editing the type', async () => {
        setup();
        await clickOnEditValueButton(screen, VALUE_IDS['URL']);
        // Could be a bug in react-select-event
        await selectEvent.select(screen.getByText('URL'), ['Text'], { container: document.body });
        await selectEvent.select(screen.getAllByText('URL')[0], ['Text'], { container: document.body });
        fireEvent.click(screen.getByRole('button', { name: 'Done' }));
        fireEvent.click(screen.getByRole('button', { name: 'Keep' }));
        expect(screen.getAllByText('Text')).toHaveLength(2);
        expect(screen.getByText('www.orkg.org')).toBeInTheDocument();
        expect(screen.queryByText(/URL/i)).toBeNull();
    });
});

describe('ValueItem', () => {
    it('should change type of value after editing the type and value', async () => {
        setup();
        await clickOnEditValueButton(screen, VALUE_IDS['Date']);
        // Could be a bug in react-select-event
        await selectEvent.select(screen.getByText('Date'), ['Text'], { container: document.body });
        await selectEvent.select(screen.getAllByText('Date')[0], ['Text'], { container: document.body });
        fireEvent.change(screen.getByPlaceholderText(/enter a value/i), { target: { value: 'New text' } });
        fireEvent.click(screen.getByRole('button', { name: 'Done' }));
        await waitFor(() => expect(screen.getByText('New text')).toBeInTheDocument());
        expect(screen.getAllByText('Text')).toHaveLength(2);
        expect(screen.queryByText(/Date/i)).toBeNull();
    });
});

describe('ValueItem', () => {
    it('should not show datatype selector on resource edit', async () => {
        setup();
        await clickOnEditValueButton(screen, VALUE_IDS['Resource']);
        expect(screen.queryByText(/Resource/i)).toBeNull();
    });
});

describe('ValueItem', () => {
    it('should not show resource datatype on literal edit', async () => {
        setup();
        await clickOnEditValueButton(screen, VALUE_IDS['Date']);
        await selectEvent.select(screen.getByText('Date'), ['Date'], { container: document.body });
        expect(screen.getAllByText(/Resource/i)).toHaveLength(1);
        expect(screen.getAllByText('Text')).toHaveLength(2);
        expect(screen.getAllByText('Date')).toHaveLength(2);
    });
});
