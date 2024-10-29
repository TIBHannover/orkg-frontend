import userEvent from '@testing-library/user-event';
import selectEvent from 'react-select-event';
import { fireEvent, render, screen, waitFor, waitForElementToBeRemoved, Screen } from 'testUtils';
import DataBrowser from 'components/DataBrowser/DataBrowser';
import { DataBrowserProps } from 'components/DataBrowser/types/DataBrowserTypes';
import { createMSWResource } from 'services/mocks/helpers';

const setup = async (
    props: DataBrowserProps = {
        id: 'R144078',
        isEditMode: true,
    },
) => {
    createMSWResource({ id: props.id, label: 'Add value resource' });
    render(<DataBrowser {...props} />);
    await waitFor(() => expect(screen.queryByText(/Add property/i)).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Add property' }));
    await userEvent.type(screen.getByRole('combobox'), 'property 1');
    await waitFor(() => expect(screen.getByText(/Loading/i)).toBeInTheDocument());
    await waitForElementToBeRemoved(() => screen.queryAllByText(/Loading/i));
    selectEvent.select(screen.getByRole('combobox'), 'property 1');
    await waitFor(() => expect(screen.getByRole('link', { name: 'property 1' })).toBeInTheDocument());
};

const setValueAndClickOnCreate = async (sc: Screen, datatype = 'Resource', value = 'test') => {
    const addButton = sc.getByRole('button', { name: 'Add value' });
    await waitFor(() => expect(addButton).toBeInTheDocument());
    fireEvent.click(addButton);
    await waitFor(() => expect(sc.getByLabelText(/Enter a resource/i)).toBeInTheDocument());
    fireEvent.change(sc.getByLabelText(/Enter a resource/i), { target: { value } });
    // await waitForElementToBeRemoved(() => screen.queryByText(/Loading/i));
    const selectInput = screen.getByText('Resource');
    await selectEvent.openMenu(selectInput);
    await selectEvent.select(selectInput, [datatype]);
    fireEvent.click(sc.getByRole('button', { name: 'Create' }));
};

describe('DataBrowser.AddValue.Validation', () => {
    it('should validate Decimal datatype', async () => {
        await setup();
        await setValueAndClickOnCreate(screen, 'Decimal');
        await waitFor(() => expect(screen.getByText(/must be a number/i)).toBeInTheDocument());
    });
});

describe('DataBrowser.AddValue.Validation', () => {
    it('should validate Integer datatype', async () => {
        await setup();
        await setValueAndClickOnCreate(screen, 'Integer');
        await waitFor(() => expect(screen.getByText(/must be a number/i)).toBeInTheDocument());
    });
});

describe('DataBrowser.AddValue.Validation', () => {
    it('should not accept Integer datatype when the value is decimal', async () => {
        await setup();
        await setValueAndClickOnCreate(screen, 'Integer', '1.5');
        await waitFor(() => expect(screen.getByText(/must be an integer/i)).toBeInTheDocument());
    });
});

describe('DataBrowser.AddValue.Validation', () => {
    it('should validate Date datatype', async () => {
        await setup();
        await setValueAndClickOnCreate(screen, 'Date');
        await waitFor(() => expect(screen.getByText(/must be in ISO 8601 date format/i)).toBeInTheDocument());
    });
});

describe('DataBrowser.AddValue.Validation', () => {
    it('should validate URL datatype', async () => {
        await setup();
        await setValueAndClickOnCreate(screen, 'URL');
        await waitFor(() => expect(screen.getByText(/must be a valid URL/i)).toBeInTheDocument());
    });
});
