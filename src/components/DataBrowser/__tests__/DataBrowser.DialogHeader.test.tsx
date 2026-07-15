import DataBrowserDialog from '@/components/DataBrowser/DataBrowserDialog';
import { createMSWPredicate, createMSWResource, createMSWStatement } from '@/services/mocks/helpers';
import { fireEvent, render, screen, waitFor } from '@/testUtils';

const PARENT_ID = 'RDialogHeaderParent';
const CHILD_ID = 'RDialogHeaderChild';
const PREDICATE_ID = 'PDialogHeaderLink';

const setup = async () => {
    createMSWResource({ id: PARENT_ID, label: 'parent resource' });
    createMSWResource({ id: CHILD_ID, label: 'child resource' });
    createMSWPredicate({ id: PREDICATE_ID, label: 'linked via' });
    createMSWStatement({ subject: PARENT_ID, predicate: PREDICATE_ID, object: CHILD_ID });
    render(<DataBrowserDialog show toggleModal={() => {}} id={PARENT_ID} />);
    await waitFor(() => expect(screen.getByRole('link', { name: /child resource/i })).toBeInTheDocument());
};

describe('DataBrowser.DialogHeader', () => {
    it('should show the heading and entity page link of the opened resource', async () => {
        await setup();
        expect(screen.getByRole('heading', { name: /view existing resource: parent resource/i })).toBeInTheDocument();
        const link = screen.getByRole('link', { name: /open resource/i });
        expect(link).toHaveAttribute('href', expect.stringContaining(`/resources/${PARENT_ID}`));
        expect(link).toHaveAttribute('href', expect.stringContaining('noRedirect'));
    });

    it('should update the heading and link when navigating to another resource (#2048)', async () => {
        await setup();
        fireEvent.click(screen.getByRole('link', { name: /child resource/i }));
        await waitFor(() => expect(screen.getByRole('heading', { name: /view existing resource: child resource/i })).toBeInTheDocument());
        expect(screen.getByRole('link', { name: /open resource/i })).toHaveAttribute('href', expect.stringContaining(`/resources/${CHILD_ID}`));
    });

    it('should restore the heading of the parent when navigating back', async () => {
        await setup();
        fireEvent.click(screen.getByRole('link', { name: /child resource/i }));
        await waitFor(() => expect(screen.getByRole('link', { name: /back/i })).toBeInTheDocument());
        fireEvent.click(screen.getByRole('link', { name: /back/i }));
        await waitFor(() => expect(screen.getByRole('heading', { name: /view existing resource: parent resource/i })).toBeInTheDocument());
    });

    it('should label a predicate as property in the heading and link', async () => {
        createMSWPredicate({ id: PREDICATE_ID, label: 'linked via' });
        render(<DataBrowserDialog show toggleModal={() => {}} id={PREDICATE_ID} />);
        await waitFor(() => expect(screen.getByRole('heading', { name: /view existing property: linked via/i })).toBeInTheDocument());
        const link = screen.getByRole('link', { name: /open property/i });
        expect(link).toHaveAttribute('href', expect.stringContaining(`/properties/${PREDICATE_ID}`));
    });
});
