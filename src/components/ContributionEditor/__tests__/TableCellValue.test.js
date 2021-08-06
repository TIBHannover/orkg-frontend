import { fireEvent, render, screen } from 'testUtils';
import TableCellValue from '../TableCellValue';

const setup = className => {
    const label = 'example label';
    const setDisableCreate = jest.fn();
    const value = {
        label,
        _class: className,
        statementId: 'S1'
    };

    render(<TableCellValue value={value} index={0} setDisableCreate={setDisableCreate} propertyId="P1" />);

    return { label, setDisableCreate };
};

describe('resource value', () => {
    test('should render a resource as button', () => {
        const { label } = setup('resource');
        expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    });

    test('should show autocomplete when clicking edit', () => {
        const { label, setDisableCreate } = setup('resource');

        fireEvent.click(screen.getByRole('button', { name: /edit/i, hidden: true }));
        const autocomplete = screen.getByRole('textbox', { name: /enter a resource/i });

        expect(autocomplete).toBeInTheDocument();
        expect(autocomplete.value).toBe(label);
        expect(setDisableCreate).toBeCalled();
    });
});

describe('literal value', () => {
    test('should render a literal as text', () => {
        const { label } = setup('literal');

        expect(screen.getByText(label)).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: label })).not.toBeInTheDocument();
    });

    test('should show input when clicking edit', () => {
        const { label, setDisableCreate } = setup('literal');

        fireEvent.click(screen.getByRole('button', { name: /edit/i, hidden: true }));
        const input = screen.getByPlaceholderText(/enter a value/i);

        expect(input).toBeInTheDocument();
        expect(input.value).toBe(label);
        expect(setDisableCreate).toBeCalled();
    });
});
