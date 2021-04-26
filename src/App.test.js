import App from './App';
import { render, screen } from 'testUtils';
import { history } from './store';

const setup = () => {
    render(<App history={history} />);
};

test('renders without crashing', () => {
    setup();
    expect(screen.getByText(/The Open Research Knowledge Graph aims to describe research papers/i)).toBeInTheDocument();
});
