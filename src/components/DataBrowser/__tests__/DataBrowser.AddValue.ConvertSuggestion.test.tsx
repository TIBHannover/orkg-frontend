import userEvent from '@testing-library/user-event';
import DataBrowser from 'components/DataBrowser/DataBrowser';
import { DataBrowserProps } from 'components/DataBrowser/types/DataBrowserTypes';
import selectEvent from 'react-select-event';
import { createMSWResource } from 'services/mocks/helpers';
import { fireEvent, render, screen, Screen, waitFor, waitForElementToBeRemoved } from 'testUtils';

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

const clickOnAddButton = async (s: Screen) => {
    await fireEvent.click(s.getByTestId('add-value-P1-false'));
};

describe('DataBrowser.AddValue.ConvertSuggestion', () => {
    it('should show Keep and Convert buttons when suggesting conversion', async () => {
        await setup();
        await clickOnAddButton(screen);
        fireEvent.change(screen.getByLabelText(/Enter a resource/i), { target: { value: 'true' } });
        const createButton = screen.getByRole('button', { name: 'Create' });
        fireEvent.click(createButton);
        await waitFor(() => expect(screen.getByText(/The value you entered looks like/i)).toBeInTheDocument());
        expect(screen.getByRole('button', { name: 'Convert' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Keep' })).toBeInTheDocument();
    });
});

describe('DataBrowser.AddValue.ConvertSuggestion', () => {
    it('should show suggest Boolean type if the value is boolean when Resource is selected', async () => {
        await setup();
        await clickOnAddButton(screen);
        fireEvent.change(screen.getByLabelText(/Enter a resource/i), { target: { value: 'true' } });
        const createButton = screen.getByRole('button', { name: 'Create' });
        fireEvent.click(createButton);
        await waitFor(() => expect(screen.getByText(/Boolean/i)).toBeInTheDocument());
    });
});

describe('DataBrowser.AddValue.ConvertSuggestion', () => {
    it('should show suggest Integer type if the value is integer when Resource is selected', async () => {
        await setup();
        await clickOnAddButton(screen);
        fireEvent.change(screen.getByLabelText(/Enter a resource/i), { target: { value: '1' } });
        const createButton = screen.getByRole('button', { name: 'Create' });
        fireEvent.click(createButton);
        await waitFor(() => expect(screen.getByText(/Integer/i)).toBeInTheDocument());
    });
});

describe('DataBrowser.AddValue.ConvertSuggestion', () => {
    it('should show suggest Decimal type if the value is decimal when Resource is selected', async () => {
        await setup();
        await clickOnAddButton(screen);
        fireEvent.change(screen.getByLabelText(/Enter a resource/i), { target: { value: '1.5' } });
        const createButton = screen.getByRole('button', { name: 'Create' });
        fireEvent.click(createButton);
        await waitFor(() => expect(screen.getByText(/Decimal/i)).toBeInTheDocument());
    });
});

describe('DataBrowser.AddValue.ConvertSuggestion', () => {
    it('should show suggest Date type if the value is decimal when Resource is selected', async () => {
        await setup();
        await clickOnAddButton(screen);
        fireEvent.change(screen.getByLabelText(/Enter a resource/i), { target: { value: '2021-11-10' } });
        const createButton = screen.getByRole('button', { name: 'Create' });
        fireEvent.click(createButton);
        await waitFor(() => expect(screen.getByText(/Date/i)).toBeInTheDocument());
    });
});

describe('DataBrowser.AddValue.ConvertSuggestion', () => {
    it('should show suggest URL type if the value is url when Resource is selected', async () => {
        await setup();
        await clickOnAddButton(screen);
        fireEvent.change(screen.getByLabelText(/Enter a resource/i), { target: { value: 'https://www.orkg.org/' } });
        const createButton = screen.getByRole('button', { name: 'Create' });
        fireEvent.click(createButton);
        await waitFor(() => expect(screen.getByText(/URL/i)).toBeInTheDocument());
    });
});

describe('DataBrowser.AddValue.ConvertSuggestion', () => {
    it('should convert to suggested datatype when clicking on Convert', async () => {
        await setup();
        await clickOnAddButton(screen);
        fireEvent.change(screen.getByLabelText(/Enter a resource/i), { target: { value: 'https://www.orkg.org/' } });
        const createButton = screen.getByRole('button', { name: 'Create' });
        fireEvent.click(createButton);
        await waitFor(() => expect(screen.getByText(/URL/i)).toBeInTheDocument());
        fireEvent.click(screen.getByRole('button', { name: 'Convert' }));
        await waitFor(() => expect(screen.getByText('https://www.orkg.org/')).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText('URL')).toHaveAttribute('title', 'xsd:anyURI'));
    });
});

describe('DataBrowser.AddValue.ConvertSuggestion', () => {
    it('should keep the selected datatype when clicking on Keep', async () => {
        await setup();
        await clickOnAddButton(screen);
        fireEvent.change(screen.getByLabelText(/Enter a resource/i), { target: { value: 'https://www.orkg.org/' } });
        const createButton = screen.getByRole('button', { name: 'Create' });
        fireEvent.click(createButton);
        await waitFor(() => expect(screen.getByText(/URL/i)).toBeInTheDocument());
        fireEvent.click(screen.getByRole('button', { name: 'Keep' }));
        await waitFor(() => expect(screen.getByRole('button', { name: 'https://www.orkg.org/' })).toBeInTheDocument());
    });
});
