import { render, screen, fireEvent, waitFor } from 'testUtils';
import TableHeaderColumn from '../TableHeaderColumn';

const setup = paperTitle => {
    const paper = {
        id: 'R1',
        label: paperTitle,
    };
    const contribution = {
        id: 'R2',
        label: 'contribution title',
    };

    render(<TableHeaderColumn paper={paper} contribution={contribution} />);
};
describe('TableHeaderColumn', () => {
    it('should show the paper and contribution title in the header', () => {
        setup('paper title');
        expect(screen.queryByRole('button', { name: /paper title/i })).toBeInTheDocument();
        expect(screen.queryByText(/contribution title/i)).toBeInTheDocument();
    });

    it('should open the edit paper modal when clicking the paper title button', async () => {
        setup('paper title');
        fireEvent.click(screen.queryByRole('button', { name: /paper title/i }));
        await waitFor(() => expect(screen.getByRole('heading', { name: /edit paper/i })).toBeInTheDocument());
    });

    it('should set "no title" when no paper title is provided', () => {
        setup('');
        expect(screen.queryByRole('button', { name: /no title/i })).toBeInTheDocument();
    });
});
