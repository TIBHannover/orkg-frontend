import applyServerErrorsToForm from '@/components/Form/utils/applyServerErrors';

describe('applyServerErrorsToForm', () => {
    it('attaches a field error to the matching form field', async () => {
        const setError = vi.fn();
        const handled = await applyServerErrorsToForm(
            { title: 'Invalid', status: 400, errors: [{ pointer: '/name', detail: 'must not be blank' }] },
            { setError },
        );

        expect(handled).toBe(true);
        expect(setError).toHaveBeenCalledWith('name', { type: 'server', message: 'must not be blank' });
    });

    it('remaps a backend field to a differently named form field via fieldMap', async () => {
        const setError = vi.fn();
        await applyServerErrorsToForm(
            { status: 400, errors: [{ pointer: '/url', detail: 'must be a valid URL' }] },
            {
                setError,
                fieldMap: { url: 'homepage' },
            },
        );

        expect(setError).toHaveBeenCalledWith('homepage', { type: 'server', message: 'must be a valid URL' });
    });

    it('resolves a wrapped pointer (e.g. multipart /properties/url) via its last segment', async () => {
        const setError = vi.fn();
        await applyServerErrorsToForm(
            { status: 400, errors: [{ pointer: '/properties/url', detail: 'must be a valid URL' }] },
            {
                setError,
                fieldMap: { url: 'homepage' },
                knownFields: ['name', 'homepage', 'description', 'logo'],
            },
        );

        expect(setError).toHaveBeenCalledWith('homepage', { type: 'server', message: 'must be a valid URL' });
        expect(setError).not.toHaveBeenCalledWith('root.server', expect.anything());
    });

    it('resolves a wrapped pointer for a directly-named field via its last segment', async () => {
        const setError = vi.fn();
        await applyServerErrorsToForm(
            { status: 400, errors: [{ pointer: '/properties/name', detail: 'must not be blank' }] },
            {
                setError,
                knownFields: ['name', 'homepage'],
            },
        );

        expect(setError).toHaveBeenCalledWith('name', { type: 'server', message: 'must not be blank' });
    });

    it('routes an unknown field to the form-level root.server error', async () => {
        const setError = vi.fn();
        await applyServerErrorsToForm(
            { status: 400, errors: [{ pointer: '/unknown', detail: 'is not allowed' }] },
            {
                setError,
                knownFields: ['name', 'homepage'],
            },
        );

        expect(setError).not.toHaveBeenCalledWith('unknown', expect.anything());
        expect(setError).toHaveBeenCalledWith('root.server', { type: 'server', message: 'is not allowed' });
    });

    it('surfaces the occurrence-level detail as a root error when there are no field errors', async () => {
        const setError = vi.fn();
        await applyServerErrorsToForm(
            { status: 409, title: 'Conflict', detail: 'An organization with this name already exists.' },
            {
                setError,
            },
        );

        expect(setError).toHaveBeenCalledWith('root.server', {
            type: 'server',
            message: 'An organization with this name already exists.',
        });
    });

    it('combines multiple unresolved field errors into a single root message', async () => {
        const setError = vi.fn();
        await applyServerErrorsToForm(
            {
                status: 400,
                errors: [
                    { pointer: '/name', detail: 'must not be blank' },
                    { pointer: '/foo', detail: 'is unknown' },
                ],
            },
            { setError, knownFields: ['name'] },
        );

        expect(setError).toHaveBeenCalledWith('name', { type: 'server', message: 'must not be blank' });
        expect(setError).toHaveBeenCalledWith('root.server', { type: 'server', message: 'is unknown' });
    });

    it('returns false and does nothing for a non-problem error', async () => {
        const setError = vi.fn();
        const handled = await applyServerErrorsToForm(new Error('network down'), { setError });

        expect(handled).toBe(false);
        expect(setError).not.toHaveBeenCalled();
    });
});
