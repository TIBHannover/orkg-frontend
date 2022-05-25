import { render, screen, waitFor } from 'testUtils';
import { ENTITIES } from 'constants/graphSettings';
import StatementBrowser from '../StatementBrowser';

jest.mock('react-flip-move', () => ({ children }) => children);
jest.mock('components/UserAvatar/UserAvatar', () => () => null);

const setup = (
    initialState = {},
    props = {
        initialSubjectId: 'R68106',
        initialSubjectLabel: 'NorESM2-LM',
        renderTemplateBox: true,
        newStore: true,
        rootNodeType: ENTITIES.RESOURCE,
        enableEdit: true,
        syncBackend: true,
    },
) => {
    render(<StatementBrowser {...props} />, { initialState });
};

describe('StatementBrowser with Template Box', () => {
    it('should render template box if the value is a template', async () => {
        setup();
        await waitFor(() => expect(screen.queryByText(/Loading/i)).toBeInTheDocument());
        await waitFor(() => expect(screen.queryAllByText(/Climate response/i)).toHaveLength(2));
        expect(screen.queryAllByText(/Climate sensitivity/i)).toHaveLength(2);
        expect(screen.queryAllByText(/Data used/i)).toHaveLength(2);
        expect(screen.queryAllByText(/Has evaluation/i)).toHaveLength(2);
        expect(screen.queryAllByText(/Template/i)).toHaveLength(3);
        expect(screen.getByText(/Has research problem/i)).toBeInTheDocument();
    });
});

describe('StatementBrowser with Template Box ', () => {
    it('should disable add value on the property that require only one value', async () => {
        setup();
        await waitFor(() => expect(screen.queryByText(/Loading/i)).toBeInTheDocument());
        await waitFor(() => expect(screen.queryAllByText(/Climate response/i)).toHaveLength(2));
        // Data used
        await waitFor(() => expect(screen.getAllByTestId('add-value-P25059-false')).toHaveLength(2));
        const addDataUsedValueButtons = screen.getAllByTestId('add-value-P25059-false');
        addDataUsedValueButtons.forEach((item, index) => {
            expect(item).toBeInTheDocument();
            expect(item).toBeDisabled();
        });
    });
});
