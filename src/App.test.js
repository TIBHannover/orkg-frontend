import { render, screen } from 'testUtils';
import App from './App';

jest.mock(
    'react-responsive-tabs',
    () =>
        ({ children }) =>
            null,
);

jest.mock('d3-hierarchy', () => ({
    stratify: jest.fn().mockImplementation(() => [jest.fn(), jest.fn(), jest.fn()]),
    tree: jest.fn().mockImplementation(() => {
        const nodeSizeMock = jest.fn().mockReturnThis(); // Return the object itself to enable method chaining
        const separationMock = jest.fn().mockReturnThis(); // Return the object itself to enable method chaining
        const treeMock = jest.fn().mockReturnThis(); // Return the object itself to enable method chaining
        treeMock.nodeSize = nodeSizeMock; // Assign the nodeSize mock function to the tree mock
        treeMock.separation = separationMock; // Assign the separation mock function to the tree mock
        return treeMock;
    }),
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
