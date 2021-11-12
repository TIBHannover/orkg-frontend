import { render, screen, fireEvent, waitFor } from 'testUtils';
import StatementBrowser from '../StatementBrowser';
import { ENTITIES } from 'constants/graphSettings';
import { statementBrowser1P7V } from '../ValueItem/__mocks__/StatementBrowserData';
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
    it('should show edit form for date when editing a Date', async () => {
        setup();
        await clickOnEditValueButton(screen, VALUE_IDS['Date']);
        const inputForm = screen.getByPlaceholderText(/enter a value/i);
        expect(inputForm).toHaveAttribute('type', 'date');
        expect(inputForm).toHaveValue('2021-11-12');
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
    it('should show edit form for text when editing a Decimal', async () => {
        setup();
        await clickOnEditValueButton(screen, VALUE_IDS['Decimal']);
        const inputForm = screen.getByPlaceholderText(/enter a value/i);
        expect(inputForm).toBeInTheDocument();
        expect(inputForm).toHaveValue('3.14');
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
    it('should show edit form for text when editing a Resource', async () => {
        setup();
        await clickOnEditValueButton(screen, VALUE_IDS['Resource']);
        const inputForm = screen.getByPlaceholderText(/enter a value/i);
        expect(inputForm).toBeInTheDocument();
        expect(inputForm).toHaveValue('Lorem ipsum Resource');
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
    it('should show edit form for text when editing a URL', async () => {
        setup();
        await clickOnEditValueButton(screen, VALUE_IDS['URL']);
        const inputForm = screen.getByPlaceholderText(/enter a value/i);
        expect(inputForm).toBeInTheDocument();
        expect(inputForm).toHaveValue('www.orkg.org');
    });
});
