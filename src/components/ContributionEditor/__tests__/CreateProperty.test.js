import { fireEvent, render, screen, waitFor } from 'testUtils';
import CreateProperty from '../CreateProperty';

const setup = () => {
    render(<CreateProperty />);
};

describe('ContributionEditor CreateProperty', () => {
    it('shows "add property" button by default', () => {
        setup();
        const button = screen.getByRole('button', { name: /add property/i });
        expect(button).toBeInTheDocument();
    });

    it('shows property autocomplete on click', async () => {
        setup();
        const button = screen.getByRole('button', { name: /add property/i });
        fireEvent.click(button);

        await waitFor(() => expect(screen.getByRole('combobox')).toBeInTheDocument());
    });

    it('should hide the property autocomplete on blur', async () => {
        setup();
        const button = screen.getByRole('button', { name: /add property/i });
        fireEvent.click(button);

        await waitFor(() => screen.getByRole('combobox'));
        fireEvent.blur(screen.getByRole('combobox'));

        expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    });
});
