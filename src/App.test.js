import Index from 'app/page';
import { render, screen } from 'testUtils';

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
    render(<Index />);
};

describe('App', () => {
    it('renders without crashing', () => {
        setup();
        expect(screen.getByText(/Browse by research field/i)).toBeInTheDocument();
    });
});
