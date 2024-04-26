import { render, screen, fireEvent, waitFor } from 'testUtils';
import TableHeaderColumn from 'components/ContributionEditor/TableHeaderColumn';

const setup = (paperTitle) => {
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
    it('should show the paper and contribution title in the header', async () => {
        setup('paper title');
        await waitFor(() => expect(screen.queryByRole('button', { name: /paper title/i })).toBeInTheDocument());
        expect(screen.queryByText(/contribution title/i)).toBeInTheDocument();
    });

    it('should open the edit paper modal when clicking the paper title button', async () => {
        setup('paper title');
        fireEvent.click(screen.queryByRole('button', { name: /paper title/i }));
        await waitFor(() => expect(screen.getByRole('heading', { name: /edit paper/i })).toBeInTheDocument());
    });

    it('should set "no title" when no paper title is provided', async () => {
        setup('');
        await waitFor(() => expect(screen.queryByRole('button', { name: /no title/i })).toBeInTheDocument());
    });
});
