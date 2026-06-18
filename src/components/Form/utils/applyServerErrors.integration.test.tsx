import { Form } from '@heroui/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';

import ControlledTextField from '@/components/Form/ControlledTextField/ControlledTextField';
import FormRootError from '@/components/Form/FormRootError/FormRootError';
import useZodForm from '@/components/Form/hooks/useZodForm';
import applyServerErrorsToForm from '@/components/Form/utils/applyServerErrors';
import { render, screen } from '@/testUtils';

// Mirrors the EditOrganization wiring: useZodForm + Controlled* fields + FormRootError,
// with the same `url` -> `homepage` fieldMap, so we cover the full integration path.
const schema = z.object({
    name: z.string().trim().min(1, 'Please enter a name'),
    homepage: z.httpUrl({ error: 'Please enter a valid homepage URL' }),
});
type FormValues = z.infer<typeof schema>;

const Harness = ({ rejection }: { rejection: unknown }) => {
    const {
        control,
        handleSubmit,
        setError,
        formState: { errors },
    } = useZodForm({ schema, values: { name: 'ORKG', homepage: 'https://orkg.org' } as FormValues });

    const onSubmit = async () => {
        await applyServerErrorsToForm(rejection, {
            setError,
            fieldMap: { url: 'homepage' },
            knownFields: Object.keys(schema.shape),
        });
    };

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <ControlledTextField control={control} name="name" label="Name" />
            <ControlledTextField control={control} name="homepage" type="url" label="Homepage" />
            <FormRootError message={errors.root?.server?.message} />
            <button type="submit">Save</button>
        </Form>
    );
};

describe('react-hook-form RFC 9457 integration', () => {
    it('renders a backend field error inline on the mapped form field', async () => {
        render(<Harness rejection={{ status: 400, title: 'Invalid', errors: [{ pointer: '/url', detail: 'must be a valid URL' }] }} />);

        await userEvent.click(screen.getByRole('button', { name: 'Save' }));

        expect(await screen.findByText('must be a valid URL')).toBeInTheDocument();
    });

    it('renders a non-field backend problem as a form-level alert', async () => {
        render(<Harness rejection={{ status: 409, title: 'Conflict', detail: 'An organization with this name already exists.' }} />);

        await userEvent.click(screen.getByRole('button', { name: 'Save' }));

        expect(await screen.findByText('An organization with this name already exists.')).toBeInTheDocument();
        expect(screen.getByText('Could not save your changes')).toBeInTheDocument();
    });
});
