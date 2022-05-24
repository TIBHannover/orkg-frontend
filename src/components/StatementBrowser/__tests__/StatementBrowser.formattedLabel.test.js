import { render, screen, waitFor, waitForElementToBeRemoved } from 'testUtils';
import { ENTITIES } from 'constants/graphSettings';
import StatementBrowser from '../StatementBrowser';

jest.mock('react-flip-move', () => ({ children }) => children);
jest.mock('components/UserAvatar/UserAvatar', () => () => null);

const setup = async (
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

describe('formatted label', () => {
    it('should render Basic reproduction number contribution', async () => {
        const config = {
            initialSubjectId: 'R44727',
            initialSubjectLabel: null,
            newStore: true,
            rootNodeType: ENTITIES.RESOURCE,
        };
        setup({}, config);
        await waitFor(() => expect(screen.queryByText(/Loading/i)).toBeInTheDocument());
        await waitForElementToBeRemoved(() => screen.queryByText(/Loading/i));
        expect(await screen.findByText(/3.1/i)).toBeInTheDocument();
        expect(await screen.findByText(/Lombardy, Italy/i)).toBeInTheDocument();
        expect(await screen.findByText(/Determination of the COVID-19 basic reproduction number/i)).toBeInTheDocument();
        expect(await screen.findByText(/2020-01-14 - 2020-03-08/i)).toBeInTheDocument();
    });
});
