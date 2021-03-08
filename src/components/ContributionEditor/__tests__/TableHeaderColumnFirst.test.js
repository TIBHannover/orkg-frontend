import { render, screen } from 'testUtils';
import TableHeaderColumnFirst from '../TableHeaderColumnFirst';

test('should show no loading and done labels by default', () => {
    render(<TableHeaderColumnFirst />, {
        initialState: {
            contributionEditor: { isLoading: false }
        }
    });

    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/done/i)).not.toBeInTheDocument();
});

test('should show the loading label on loading', () => {
    render(<TableHeaderColumnFirst />, {
        initialState: {
            contributionEditor: { isLoading: true }
        }
    });

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(screen.queryByText(/done/i)).not.toBeInTheDocument();
});
