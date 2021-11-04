import { fireEvent, render, screen, waitFor } from 'testUtils';
import CreateProperty from '../CreateProperty';

const setup = () => {
    render(<CreateProperty />);
};

test('shows "add property" button by default', () => {
    setup();
    const button = screen.getByRole('button', { name: /add property/i });
    expect(button).toBeInTheDocument();
});

test('shows property autocomplete on click', async () => {
    setup();
    const button = screen.getByRole('button', { name: /add property/i });
    fireEvent.click(button);

    await waitFor(() => expect(screen.getByRole('textbox')).toBeInTheDocument());
});

test('should hide the property autocomplete on blur', async () => {
    setup();
    const button = screen.getByRole('button', { name: /add property/i });
    fireEvent.click(button);

    await waitFor(() => screen.getByRole('textbox'));
    fireEvent.blur(screen.getByRole('textbox'));

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
});
