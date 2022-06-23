import { render, screen, fireEvent, waitFor } from 'testUtils';
import TableCellValueResource from '../TableCellValueResource';

const setup = () => {
    const label = 'resource label';
    const value = {
        id: 'R1',
        label,
    };

    render(<TableCellValueResource value={value} />);

    return { label };
};
describe('TableCellValueResource', () => {
    it('should render a button with the resource label', () => {
        const { label } = setup();
        expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    });

    it('should open the statement browser dialog on resource click', async () => {
        const { label } = setup();
        fireEvent.click(screen.getByRole('button', { name: label }));
        await waitFor(() => expect(screen.getByText(`view existing resource: ${label}`, { exact: false })).toBeInTheDocument());
    });
});
