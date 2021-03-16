import TableScrollContainer from 'components/Comparison/TableScrollContainer';
import { PREDICATES } from 'constants/graphSettings';
import { fireEvent, render, screen, waitFor, within } from 'testUtils';
import EditTable from '../EditorTable';
import { contribution, contributionLiteralOnly } from '../__mocks__/ComparisonData';

// mock the ResizeObserver
class ResizeObserver {
    observe() {}
    unobserve() {}
}

window.ResizeObserver = ResizeObserver;

const setup = (initialState = {}) => {
    render(
        <TableScrollContainer className="contribution-editor">
            <EditTable />
        </TableScrollContainer>,
        { initialState }
    );
};

describe('table', () => {
    test('should not crash when no contribution data is provided', () => {
        setup();
        expect(screen.getByRole('table')).toBeInTheDocument();
    });

    test('should render when contribution data is provided', () => {
        setup(contribution);

        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.getByText('test literal')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'test paper' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'test resource 2' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Test property' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Test property 2' })).toBeInTheDocument();
    });
});

describe('literals', () => {
    test('should update table when literal is updated', async () => {
        setup(contributionLiteralOnly);

        const cell = screen.getByRole('cell', { name: /test literal/i, hidden: true });

        fireEvent.click(within(cell).getByRole('button', { name: /edit/i, hidden: true }));
        const input = within(cell).getByPlaceholderText(/enter a literal/i);

        fireEvent.change(input, { target: { value: 'updated literal' } });
        fireEvent.blur(input);
        await waitFor(() => screen.getByRole('cell', { name: /updated literal/i, hidden: true }));

        expect(screen.getByRole('cell', { name: /updated literal/i, hidden: true })).toBeInTheDocument();
    });

    test('should update table when literal is created', async () => {
        setup(contributionLiteralOnly);

        const cell = screen.getByRole('cell', { name: /test literal/i, hidden: true });

        fireEvent.click(within(cell).getByRole('button', { name: /add/i, hidden: true }));
        const input = within(cell).getByPlaceholderText(/enter a value/i);

        fireEvent.change(input, { target: { value: 'new literal' } });
        fireEvent.blur(input);

        expect(screen.getByRole('cell', { name: /new literal/i, hidden: true })).toBeInTheDocument();
    });

    test('should update table when literal is removed', async () => {
        setup(contributionLiteralOnly);

        // click delete button next to literal
        const cell = screen.getByRole('cell', { name: /test literal/i, hidden: true });
        fireEvent.click(within(cell).getByRole('button', { name: /delete/i, hidden: true }));

        // confirm deletion
        const tooltip = screen.getByRole('tooltip', { name: /are you sure to delete?/i });
        fireEvent.click(within(tooltip).getByRole('button', { name: /delete/i }));

        expect(screen.queryByRole('cell', { name: /test literal/i, hidden: true })).not.toBeInTheDocument();
    });
});

describe('resources', () => {
    test('should update table when resources is updated', async () => {
        setup(contribution);
        // wait until loaded
        await waitFor(() => screen.getByRole('button', { name: PREDICATES.HAS_RESEARCH_PROBLEM }));

        const cell = screen.getByRole('cell', { name: /test resource 2/i, hidden: true });

        fireEvent.click(within(cell).getByRole('button', { name: /edit/i, hidden: true }));
        const input = within(cell).getByRole('textbox', /enter a resource/i);

        fireEvent.mouseDown(input);
        fireEvent.change(input, { target: { value: 'updated resource' } });
        await waitFor(() => screen.getByText(/create "updated resource"/i));

        fireEvent.click(screen.getByText(/create "updated resource"/i));

        await waitFor(() => screen.getByRole('cell', { name: /updated resource/i, hidden: true }));
        expect(screen.getByRole('cell', { name: /updated resource/i, hidden: true })).toBeInTheDocument();
    });

    // TODO: test creating resources
});
