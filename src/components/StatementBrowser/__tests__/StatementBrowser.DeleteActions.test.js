import { render, screen, fireEvent, waitFor } from 'testUtils';
import StatementBrowser from '../StatementBrowser';
import { ENTITIES } from 'constants/graphSettings';
import { statementBrowser1P2V } from '../ValueItem/__mocks__/StatementBrowserDataValueItem';

jest.mock('react-flip-move', () => ({ children }) => children);
jest.mock('components/UserAvatar/UserAvatar', () => () => null);

const setup = (
    initialState = statementBrowser1P2V,
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

const clickOnDeleteValueButton = async screen => {
    const deleteButton = screen.getByRole('button', { name: 'Delete value' });
    expect(deleteButton).toBeInTheDocument();
    fireEvent.click(deleteButton);
};

const clickOnDeletePropertyButton = async screen => {
    const deleteButton = screen.getByRole('button', { name: 'Delete property' });
    expect(deleteButton).toBeInTheDocument();
    fireEvent.click(deleteButton);
};

describe('ValueItem', () => {
    it('should show confirmation box when clicking on delete value button', async () => {
        setup();
        await clickOnDeleteValueButton(screen);
        await waitFor(() => expect(screen.getByText(/Are you sure to delete/i)).toBeInTheDocument());
        expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
        expect(screen.getByText(/Lorem ipsum/i)).toBeInTheDocument();
    });
});

describe('ValueItem', () => {
    it('should delete value on confirm', async () => {
        setup();
        expect(screen.queryByText(/Lorem ipsum/i)).toBeInTheDocument();
        await clickOnDeleteValueButton(screen);
        await waitFor(() => expect(screen.getByText(/Are you sure to delete/i)).toBeInTheDocument());
        fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
        expect(screen.queryByText(/Lorem ipsum/i)).toBeNull();
    });
});

describe('ValueItem', () => {
    it('should cancel delete value on cancel', async () => {
        setup();
        expect(screen.queryByText(/Lorem ipsum/i)).toBeInTheDocument();
        await clickOnDeleteValueButton(screen);
        await waitFor(() => expect(screen.getByText(/Are you sure to delete/i)).toBeInTheDocument());
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        expect(screen.queryByText(/Lorem ipsum/i)).toBeInTheDocument();
    });
});

describe('StatementItem', () => {
    it('should show confirmation box when clicking on delete property button', async () => {
        setup();
        await clickOnDeletePropertyButton(screen);
        await waitFor(() => expect(screen.getByText(/Are you sure to delete/i)).toBeInTheDocument());
        expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
        expect(screen.getByText(/Has evaluation/i)).toBeInTheDocument();
    });
});

describe('StatementItem', () => {
    it('should delete property on confirm', async () => {
        setup();
        expect(screen.queryByText(/Has evaluation/i)).toBeInTheDocument();
        expect(screen.queryByText(/Lorem ipsum/i)).toBeInTheDocument();
        await clickOnDeletePropertyButton(screen);
        await waitFor(() => expect(screen.getByText(/Are you sure to delete/i)).toBeInTheDocument());
        fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
        expect(screen.queryByText(/Has evaluation/i)).toBeNull();
        expect(screen.queryByText(/Lorem ipsum/i)).toBeNull();
    });
});

describe('ValueItem', () => {
    it('should cancel delete property on cancel', async () => {
        setup();
        expect(screen.queryByText(/Has evaluation/i)).toBeInTheDocument();
        expect(screen.queryByText(/Lorem ipsum/i)).toBeInTheDocument();
        await clickOnDeletePropertyButton(screen);
        await waitFor(() => expect(screen.getByText(/Are you sure to delete/i)).toBeInTheDocument());
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        expect(screen.queryByText(/Has evaluation/i)).toBeInTheDocument();
        expect(screen.queryByText(/Lorem ipsum/i)).toBeInTheDocument();
    });
});
