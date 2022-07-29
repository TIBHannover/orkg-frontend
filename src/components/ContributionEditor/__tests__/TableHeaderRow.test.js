import { render, screen, fireEvent } from 'testUtils';
import TableHeaderRow from '../TableHeaderRow';

const setup = () => {
    const property = {
        id: 'P1',
        label: 'property label',
    };

    render(<TableHeaderRow property={property} />);
};
describe('TableHeaderRow', () => {
    it('should show the property title in the row header', () => {
        setup();
        expect(screen.getByRole('button', { name: /property label/i })).toBeInTheDocument();
    });

    it('should open statement browser on property click', () => {
        setup();
        fireEvent.click(screen.getByRole('button', { name: /property label/i }));
        expect(screen.getByRole('heading', { name: /view existing property/i })).toBeInTheDocument();
    });

    it('should show autocomplete on property edit', () => {
        setup();
        fireEvent.click(screen.getByRole('button', { name: /edit/i, hidden: true }));
        expect(screen.getByRole('combobox', { name: /enter a property/i })).toBeInTheDocument();
    });

    it('should hide autocomplete on blur input', () => {
        setup();
        fireEvent.click(screen.getByRole('button', { name: /edit/i, hidden: true }));
        fireEvent.blur(screen.getByRole('combobox', { name: /enter a property/i }));
        expect(screen.getByRole('button', { name: /property label/i })).toBeInTheDocument();
    });
});
