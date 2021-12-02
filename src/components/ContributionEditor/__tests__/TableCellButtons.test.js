import { fireEvent, render, screen } from 'testUtils';
import TableCellButtons from '../TableCellButtons';

const setup = () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();

    render(<TableCellButtons onEdit={onEdit} onDelete={() => {}} backgroundColor="rgba(240, 242, 247, 0.8)" />);

    return { onEdit, onDelete };
};
describe('TableCellButtons', () => {
    it('should call "onEdit" when clicking the edit button', () => {
        const { onEdit } = setup();
        fireEvent.click(screen.getByRole('button', { name: /edit/i, hidden: true }));
        expect(onEdit).toHaveBeenCalled();
    });

    it('should not call "onDelete" when clicking the delete button', () => {
        const { onDelete } = setup();
        fireEvent.click(screen.getByRole('button', { name: /delete/i, hidden: true }));
        expect(onDelete).not.toHaveBeenCalled();
    });
});
