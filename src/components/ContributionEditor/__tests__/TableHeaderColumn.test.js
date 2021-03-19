import { render, screen, fireEvent } from 'testUtils';
import TableHeaderColumn from '../TableHeaderColumn';

const setup = paperTitle => {
    const paper = {
        id: 'R1',
        label: paperTitle
    };
    const contribution = {
        id: 'R2',
        label: 'contribution title'
    };

    render(<TableHeaderColumn paper={paper} contribution={contribution} />);
};

test('should show the paper and contribution title in the header', () => {
    setup('paper title');
    expect(screen.queryByRole('button', { name: /paper title/i })).toBeInTheDocument();
    expect(screen.queryByText(/contribution title/i)).toBeInTheDocument();
});

test('should open the edit paper modal when clicking the paper title button', () => {
    setup('paper title');
    fireEvent.click(screen.queryByRole('button', { name: /paper title/i }));
    expect(screen.getByRole('heading', { name: /edit paper/i })).toBeInTheDocument();
});

test('should set "no title" when no paper title is provided', () => {
    setup('');
    expect(screen.queryByRole('button', { name: /no title/i })).toBeInTheDocument();
});
