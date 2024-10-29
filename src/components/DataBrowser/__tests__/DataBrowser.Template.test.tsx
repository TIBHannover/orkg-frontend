import DataBrowser from 'components/DataBrowser/DataBrowser';
import { DataBrowserProps } from 'components/DataBrowser/types/DataBrowserTypes';
import { History } from 'components/DataBrowser/hooks/useHistory';
import { parseAsJson, useQueryState } from 'nuqs';
import { useEffect } from 'react';
import { fireEvent, render, screen, waitFor } from 'testUtils';

// Clear history of DataBrowser due to this issue: https://github.com/47ng/nuqs/issues/259#issuecomment-2372431672
const ClearHistory = ({ children }: { children: React.ReactNode }) => {
    const [, setHistory] = useQueryState('history', parseAsJson<History>().withDefault([]));

    useEffect(() => {
        setHistory([]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return children;
};

const Setup = (
    props: DataBrowserProps = {
        id: 'R144080',
        isEditMode: false,
    },
) => {
    render(
        <ClearHistory>
            <DataBrowser {...props} />
        </ClearHistory>,
    );
};

describe('DataBrowser.Template', () => {
    it('should load template of a resource and add required properties', async () => {
        await Setup();
        await waitFor(() => expect(screen.queryAllByText(/Basic reproduction number/i)).toHaveLength(2));
        expect(screen.getByText(/Location/i)).toBeInTheDocument();
        expect(screen.getByText(/Time period/i)).toBeInTheDocument();
    });
});

describe('DataBrowser.Template', () => {
    it('should add blank node', async () => {
        await Setup({ id: 'R144080', isEditMode: true });
        await waitFor(() => expect(screen.queryAllByText(/Basic reproduction number/i)).toHaveLength(2));
        // Basic reproduction number
        await waitFor(() => expect(screen.getByTestId('add-value-P23140-true')).toBeInTheDocument());
        fireEvent.click(screen.getByTestId('add-value-P23140-true'));
        await waitFor(() => expect(screen.getByText(/Test Resource R0/i)).toBeInTheDocument());
        // fireEvent.click(screen.getByRole('button', { name: /back/i }));
    });
});

describe('DataBrowser.Template', () => {
    it('should disable add value after adding a value on the property that require only one value', async () => {
        await Setup({ id: 'R144080', isEditMode: true });
        await waitFor(() => expect(screen.queryAllByText(/Basic reproduction number/i)).toHaveLength(2));
        // Basic reproduction number
        await waitFor(() => expect(screen.getByTestId('add-value-P23140-true')).toBeInTheDocument());
        fireEvent.click(screen.getByTestId('add-value-P23140-true'));
        await waitFor(() => expect(screen.getByText(/value/i)).toBeInTheDocument());
        fireEvent.click(screen.getByRole('button', { name: /back/i }));
        await waitFor(() => expect(screen.getByText(/Test Resource R0/i)).toBeInTheDocument());
        const addR0Value = screen.getByTestId('add-value-P23140-true');
        expect(addR0Value).toBeInTheDocument();
        expect(addR0Value).toBeDisabled();
    });
});

describe('DataBrowser.Template', () => {
    it('should disable delete property for required properties', async () => {
        await Setup({ id: 'R144080', isEditMode: true });
        await waitFor(() => expect(screen.queryAllByText(/Basic reproduction number/i)).toHaveLength(2));
        // Basic reproduction number
        const deleteR0Property = screen.getByTestId('delete-property-P23140');
        expect(deleteR0Property).toBeInTheDocument();
        expect(deleteR0Property).toBeDisabled();
    });
});

/*
describe('DataBrowser.Template', () => {
    it('should add value of the range specified by the template', async () => {
        await Setup({ id: 'R144080', isEditMode: true });
        await waitFor(() => expect(screen.queryAllByText(/Basic reproduction number/i)).toHaveLength(2));
        // Location
        await waitFor(() => expect(screen.getByTestId('add-value-P5049-false')).toBeInTheDocument());
        fireEvent.click(screen.getByTestId('add-value-P5049-false'));
        fireEvent.change(screen.getByLabelText(/Enter a resource/i), { target: { value: 'Hannover' } });
        // await waitForElementToBeRemoved(() => screen.queryAllByText(/Loading/i));
        await selectEvent.select(screen.getByRole('combobox', { name: /Enter a resource/i, hidden: true }), /Hannover/i);
        await waitFor(() => expect(screen.getByText(/Hannover/i)).toBeInTheDocument());
        // Because location has cardinality 1, the button add should be disabled after adding a new value
        const addLocationValue = screen.getByTestId('add-value-P5049-false');
        expect(addLocationValue).toBeInTheDocument();
        expect(addLocationValue).toBeDisabled();
    });
});
*/
