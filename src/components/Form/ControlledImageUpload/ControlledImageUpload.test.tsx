import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';

import ControlledImageUpload from '@/components/Form/ControlledImageUpload/ControlledImageUpload';
import { render, screen } from '@/testUtils';

type FormValues = { logo: File | string };

const Harness = ({ defaultLogo = '' }: { defaultLogo?: string }) => {
    const { control } = useForm<FormValues>({ defaultValues: { logo: defaultLogo } });
    return <ControlledImageUpload control={control} name="logo" label="Logo" alt="logo preview" />;
};

describe('ControlledImageUpload', () => {
    beforeEach(() => {
        let counter = 0;
        // jsdom doesn't implement object URLs; provide deterministic stand-ins.
        URL.createObjectURL = vi.fn(() => `blob:mock-${(counter += 1)}`);
        URL.revokeObjectURL = vi.fn();
    });

    it('shows an existing remote logo (string value) as the initial preview', () => {
        render(<Harness defaultLogo="https://example.com/logo.png" />);
        expect(screen.getByRole('img', { name: 'logo preview' })).toHaveAttribute('src', 'https://example.com/logo.png');
    });

    it('renders no preview when there is no value yet', () => {
        render(<Harness />);
        expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('previews a newly selected file via an object URL and shows its name', async () => {
        const { container } = render(<Harness />);
        const input = container.querySelector('input[type="file"]') as HTMLInputElement;

        const file = new File(['hello'], 'new-logo.png', { type: 'image/png' });
        await userEvent.upload(input, file);

        const img = await screen.findByRole('img', { name: 'logo preview' });
        expect(img).toHaveAttribute('src', 'blob:mock-1');
        expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
        expect(screen.getByText('new-logo.png')).toBeInTheDocument();
    });

    it('revokes the object URL on unmount', async () => {
        const { container, unmount } = render(<Harness />);
        const input = container.querySelector('input[type="file"]') as HTMLInputElement;
        await userEvent.upload(input, new File(['hi'], 'logo.png', { type: 'image/png' }));
        await screen.findByRole('img', { name: 'logo preview' });

        unmount();
        expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-1');
    });
});
