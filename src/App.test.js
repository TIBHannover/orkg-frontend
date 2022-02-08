import App from './App';
import { render, screen } from 'testUtils';
import { history } from './store';

jest.mock('react-responsive-tabs', () => ({ children }) => null);

const setup = () => {
    render(<App history={history} />);
};
describe('App', () => {
    it('renders without crashing', () => {
        setup();
        expect(screen.getByText(/The Open Research Knowledge Graph aims to describe research papers/i)).toBeInTheDocument();
    });
});
