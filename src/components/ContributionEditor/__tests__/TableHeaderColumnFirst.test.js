import { render, screen } from 'testUtils';
import TableHeaderColumnFirst from '../TableHeaderColumnFirst';

test('should show saved label by default', () => {
    render(<TableHeaderColumnFirst />, {
        initialState: {
            contributionEditor: { isLoading: false }
        }
    });
    expect(screen.queryByText(/saved/i)).toBeInTheDocument();
});

test('should show the loading label on loading', () => {
    render(<TableHeaderColumnFirst />, {
        initialState: {
            contributionEditor: { isLoading: true }
        }
    });

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(screen.queryByText(/saved/i)).not.toBeInTheDocument();
});
