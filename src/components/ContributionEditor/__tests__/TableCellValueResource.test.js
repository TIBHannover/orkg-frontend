import { render, screen, fireEvent } from 'testUtils';
import TableCellValueResource from '../TableCellValueResource';

const setup = () => {
    const label = 'resource label';
    const value = {
        id: 'R1',
        label: label
    };

    render(<TableCellValueResource value={value} />);

    return { label };
};

test('should render a button with the resource label', () => {
    const { label } = setup();
    expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
});

test('should open the statement browser dialog on resource click', () => {
    const { label } = setup();
    fireEvent.click(screen.getByRole('button', { name: label }));
    expect(screen.getByText(`view existing resource: ${label}`, { exact: false })).toBeInTheDocument();
});
