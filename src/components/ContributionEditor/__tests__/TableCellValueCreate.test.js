import { render, screen, fireEvent } from 'testUtils';
import selectEvent from 'react-select-event';
import TableCellValueCreate from '../TableCellValueCreate';

const setup = () => {
    render(<TableCellValueCreate contributionId="R1" propertyId="P1" isEmptyCell isVisible={true} />);
};
describe('TableCellValueCreate', () => {
    it('should not render anything when visible is false', () => {
        render(<TableCellValueCreate contributionId="R1" propertyId="P1" isEmptyCell isVisible={false} />);

        expect(screen.queryByRole('button', { name: /add value/i, hidden: true })).not.toBeInTheDocument();
        expect(screen.queryByPlaceholderText(/enter a value/i)).not.toBeInTheDocument();
        expect(screen.queryByRole('combobox', { name: /enter a resource/i })).not.toBeInTheDocument();
    });

    it('should render add button when visible is true', () => {
        setup();
        expect(screen.getByRole('button', { name: /add value/i, hidden: true })).toBeInTheDocument();
        expect(screen.queryByPlaceholderText(/enter a value/i)).not.toBeInTheDocument();
        expect(screen.queryByRole('combobox', { name: /enter a resource/i })).not.toBeInTheDocument();
    });

    it('should show literal input when add button is clicked', () => {
        setup();
        fireEvent.click(screen.getByRole('button', { name: /add value/i, hidden: true }));
        expect(screen.getByPlaceholderText(/enter a value/i)).toBeInTheDocument();
    });

    it('should switch to autocomplete when resource type is selected', async () => {
        setup();
        fireEvent.click(screen.getByRole('button', { name: /add value/i, hidden: true }));
        const selectInput = screen.getByText(/text/i);
        await selectEvent.openMenu(selectInput);
        await selectEvent.select(selectInput, ['Resource'], { container: document.body });
        expect(screen.getByRole('combobox', { name: /enter a resource/i })).toBeInTheDocument();
    });

    it('should switch to literal input when literal type is selected', async () => {
        setup();
        fireEvent.click(screen.getByRole('button', { name: /add value/i, hidden: true }));
        // use wait for to prevent "Can't perform a React state update on an unmounted component. This is a no-op" warning
        const selectInput = screen.getByText(/text/i);
        await selectEvent.openMenu(selectInput);
        await selectEvent.select(selectInput, ['Resource'], { container: document.body });
        expect(screen.getByRole('combobox', { name: /enter a resource/i })).toBeInTheDocument();
        await selectEvent.openMenu(selectInput);
        await selectEvent.select(selectInput, ['Text'], { container: document.body });
        expect(screen.getByPlaceholderText(/enter a value/i)).toBeInTheDocument();
    });

    it('should hide inputs when clicked outside', async () => {
        setup();
        fireEvent.click(screen.getByRole('button', { name: /add value/i, hidden: true }));
        fireEvent.mouseDown(document);
        expect(screen.queryByPlaceholderText(/enter a value/i)).not.toBeInTheDocument();
    });
});
