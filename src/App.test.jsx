import { render, screen } from 'testUtils';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import Index from 'app/page';

vi.mock('d3-hierarchy', () => ({
    stratify: vi.fn().mockImplementation(() => [vi.fn(), vi.fn(), vi.fn()]),
    tree: vi.fn().mockImplementation(() => {
        const nodeSizeMock = vi.fn().mockReturnThis();
        const separationMock = vi.fn().mockReturnThis();
        const treeMock = vi.fn().mockReturnThis();
        treeMock.nodeSize = nodeSizeMock;
        treeMock.separation = separationMock;
        return treeMock;
    }),
}));

beforeAll(() => {
    window.scrollTo = vi.fn();
});

const setup = () => {
    render(<Index />);
};

describe('App', () => {
    it('renders without crashing', () => {
        setup();
        expect(screen.getByText(/Browse by research field/i)).toBeInTheDocument();
    });
});
