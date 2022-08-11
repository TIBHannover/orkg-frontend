import { render, screen, waitFor } from 'testUtils';
import { ENTITIES } from 'constants/graphSettings';
import StatementBrowser from '../StatementBrowser';

jest.mock('react-flip-move', () => ({ children }) => children);
jest.mock('components/UserAvatar/UserAvatar', () => () => null);

const setup = (
    initialState = {},
    props = {
        initialSubjectId: 'R1',
        initialSubjectLabel: null,
        newStore: true,
        rootNodeType: ENTITIES.RESOURCE,
    },
) => {
    render(<StatementBrowser {...props} />, { initialState });
};

describe('statement browser', () => {
    it('should render statement browser', async () => {
        const config = {
            initialSubjectId: 'R1',
            initialSubjectLabel: null,
            newStore: true,
            rootNodeType: ENTITIES.RESOURCE,
        };
        setup({}, config);
        await waitFor(() => expect(screen.queryByText(/Loading/i)).toBeInTheDocument());
        expect(await screen.findByText(/No data yet/i)).toBeInTheDocument();
    });
});
