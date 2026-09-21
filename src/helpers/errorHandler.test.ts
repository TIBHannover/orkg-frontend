import { toast } from '@heroui/react';
import { ResponseError } from '@orkg/orkg-client';

import errorHandler from '@/helpers/errorHandler';
import { BackendError } from '@/services/backend/error';

vi.mock('@heroui/react', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@heroui/react')>()),
    toast: { danger: vi.fn() },
}));

const problemBody = {
    type: 'orkg:problem:invalid_argument',
    title: 'Bad Request',
    status: 400,
    detail: 'Invalid request content.',
    errors: [{ pointer: '#/description', detail: 'must not be blank' }],
};

describe('errorHandler', () => {
    beforeEach(() => {
        vi.mocked(toast.danger).mockClear();
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
    });

    // the generated client throws before the body is read, so the field error only becomes
    // visible once the response is parsed — a sync handler showed "Response returned an error code"
    it('toasts the field error carried by an unread orkg-client ResponseError', async () => {
        const error = new ResponseError(new Response(JSON.stringify(problemBody), { status: 400 }), 'Response returned an error code');

        await expect(errorHandler({ error, shouldShowToast: true })).rejects.toBeInstanceOf(BackendError);

        expect(toast.danger).toHaveBeenCalledWith('An error occurred. The description must not be blank');
    });

    it('uses the caller-provided field label', async () => {
        const error = new ResponseError(new Response(JSON.stringify(problemBody), { status: 400 }));

        await expect(errorHandler({ error, shouldShowToast: true, fieldLabels: { description: 'Description' } })).rejects.toThrow();

        expect(toast.danger).toHaveBeenCalledWith('An error occurred. The Description must not be blank');
    });

    it('falls back to the problem detail when there is no field error', async () => {
        const error = new ResponseError(new Response(JSON.stringify({ ...problemBody, errors: [] }), { status: 400 }));

        await expect(errorHandler({ error, shouldShowToast: true })).rejects.toThrow();

        expect(toast.danger).toHaveBeenCalledWith('Invalid request content.');
    });

    it('rethrows a non-backend error with its own message', async () => {
        const error = new Error('Failed to fetch');

        await expect(errorHandler({ error, shouldShowToast: true })).rejects.toBe(error);

        expect(toast.danger).toHaveBeenCalledWith('Failed to fetch');
    });
});
