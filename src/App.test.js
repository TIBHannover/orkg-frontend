import { render, screen } from 'testUtils';
import App from './App';

jest.mock(
    'react-responsive-tabs',
    () =>
        ({ children }) =>
            null,
);

jest.mock('react-dnd', () => ({
    useDrag: jest.fn().mockImplementation(() => [jest.fn(), jest.fn(), jest.fn()]),
    useDrop: jest.fn().mockImplementation(() => [jest.fn(), jest.fn(), jest.fn()]),
}));

window.scrollTo = jest.fn();

const setup = () => {
    render(<App />);
};
describe('App', () => {
    it('renders without crashing', () => {
        setup();
        expect(screen.getByText(/The Open Research Knowledge Graph aims to describe research papers/i)).toBeInTheDocument();
    });
});
