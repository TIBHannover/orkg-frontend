import userEvent from '@testing-library/user-event';
import selectEvent from 'react-select-event';

import DataBrowser from '@/components/DataBrowser/DataBrowser';
import { DataBrowserProps } from '@/components/DataBrowser/types/DataBrowserTypes';
import { createMSWResource } from '@/services/mocks/helpers';
import { fireEvent, render, Screen, screen, waitFor, waitForElementToBeRemoved } from '@/testUtils';

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

describe('DataBrowser.AddValue', () => {
    it('should show add value button', async () => {
        await setup();
        const addButton = screen.getByRole('button', { name: 'Add value' });
        await waitFor(() => expect(addButton).toBeInTheDocument());
    });
});

describe('DataBrowser.AddValue', () => {
    it('should show add value input form', async () => {
        await setup();
        await clickOnAddButton(screen);
        await waitFor(() => expect(screen.getByLabelText(/Enter a resource/i)).toBeInTheDocument());
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
        const createButton = screen.getByRole('button', { name: /Create/i });
        expect(createButton).toBeInTheDocument();
        expect(createButton).toBeDisabled();
        const inputs = screen.getAllByRole('combobox');
        expect(inputs).toHaveLength(2);
        inputs.forEach((item, index) => {
            if (index === 0) {
                expect(item).toHaveAttribute('id', 'datatypeSelector');
            }
        });
    });
});

describe('DataBrowser.AddValue', () => {
    it('should hide input form on Cancel', async () => {
        await setup();
        await clickOnAddButton(screen);
        expect(() => screen.getByRole('button', { name: 'Add value' })).toThrow();
        const cancelButton = screen.getByRole('button', { name: 'Cancel' });
        fireEvent.click(cancelButton);
        expect(screen.getByRole('button', { name: 'Add value' })).toBeInTheDocument();
    });
});

describe('DataBrowser.AddValue', () => {
    it('should show text field on switch to Text datatype', async () => {
        await setup();
        await clickOnAddButton(screen);
        const selectInput = screen.getByText('Resource');
        await selectEvent.openMenu(selectInput);
        await selectEvent.select(selectInput, ['Text']);
        expect(screen.getByPlaceholderText(/enter a text/i)).toBeInTheDocument();
    });
});

describe('DataBrowser.AddValue', () => {
    it('should show text field on switch to Decimal datatype', async () => {
        await setup();
        await clickOnAddButton(screen);
        const selectInput = screen.getByText('Resource');
        await selectEvent.openMenu(selectInput);
        await selectEvent.select(selectInput, ['Decimal']);
        expect(screen.getByPlaceholderText(/enter a decimal/i)).toBeInTheDocument();
    });
});

describe('DataBrowser.AddValue', () => {
    it('should show text field on switch to Integer datatype', async () => {
        await setup();
        await clickOnAddButton(screen);
        const selectInput = screen.getByText('Resource');
        await selectEvent.openMenu(selectInput);
        await selectEvent.select(selectInput, ['Integer']);
        expect(screen.getByPlaceholderText(/enter a integer/i)).toBeInTheDocument();
    });
});

describe('DataBrowser.AddValue', () => {
    it('should show select option field on switch to Boolean datatype', async () => {
        await setup();
        await clickOnAddButton(screen);
        const selectInput = screen.getByText('Resource');
        await selectEvent.openMenu(selectInput);
        await selectEvent.select(selectInput, ['Boolean']);
        expect(screen.getByRole('option', { name: 'True' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'False' })).toBeInTheDocument();
        // @ts-expect-error
        expect(screen.getByRole('option', { name: 'False' }).selected).toBe(true);
        expect(screen.getByRole('button', { name: 'Create' })).not.toBeDisabled();
    });
});

describe('DataBrowser.AddValue', () => {
    it('should show date field on switch to Date datatype', async () => {
        await setup();
        await clickOnAddButton(screen);
        const selectInput = screen.getByText('Resource');
        await selectEvent.openMenu(selectInput);
        await selectEvent.select(selectInput, ['Date']);
        expect(screen.getByPlaceholderText(/enter a date/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/enter a date/i)).toHaveAttribute('type', 'date');
    });
});

describe('DataBrowser.AddValue', () => {
    it('should show text field on switch to URL datatype', async () => {
        await setup();
        await clickOnAddButton(screen);
        const selectInput = screen.getByText('Resource');
        await selectEvent.openMenu(selectInput);
        await selectEvent.select(selectInput, ['URL']);
        expect(screen.getByPlaceholderText(/enter a url/i)).toBeInTheDocument();
    });
});

describe('DataBrowser.AddValue', () => {
    it('should add resource when selected from the option', async () => {
        await setup();
        await clickOnAddButton(screen);
        await fireEvent.change(screen.getByLabelText(/Enter a resource/i), { target: { value: 'resource label 0' } });
        await waitForElementToBeRemoved(() => screen.queryAllByText(/Loading/i));
        selectEvent.select(screen.getByRole('combobox', { name: /Enter a resource/i }), 'resource label 0');
        // await waitForElementToBeRemoved(() => screen.queryByText(/Loading/i));
        await waitForElementToBeRemoved(() => screen.getByRole('combobox', { name: /Enter a resource/i }));
        await waitFor(() => expect(screen.getByRole('button', { name: 'resource label 0' })).toBeInTheDocument());
        const addButton = screen.getByRole('button', { name: 'Add value' });
        await waitFor(() => expect(addButton).toBeInTheDocument());
    });
});

describe('DataBrowser.AddValue', () => {
    it('should create resource when clicking on create button', async () => {
        await setup();
        await clickOnAddButton(screen);
        fireEvent.change(screen.getByLabelText(/Enter a resource/i), { target: { value: 'new resource via create button' } });
        const createButton = screen.getByRole('button', { name: 'Create' });
        fireEvent.click(createButton);
        await waitFor(() => expect(screen.getByRole('button', { name: /new resource via create button/i })).toBeInTheDocument());
        const addButton = screen.getByRole('button', { name: 'Add value' });
        await waitFor(() => expect(addButton).toBeInTheDocument());
    });
});

describe('DataBrowser.AddValue', () => {
    it('should create a string literal when choosing Text datatype and clicking on create button', async () => {
        await setup();
        await clickOnAddButton(screen);
        const selectInput = screen.getByText('Resource');
        await selectEvent.openMenu(selectInput);
        await selectEvent.select(selectInput, ['Text']);
        fireEvent.change(screen.getByPlaceholderText(/enter a text/i), { target: { value: 'Literal 1' } });
        fireEvent.click(screen.getByRole('button', { name: 'Create' }));
        await waitFor(() => expect(screen.getByText('Literal 1')).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText('Text')).toHaveAttribute('title', 'xsd:string'));
    });
});

describe('DataBrowser.AddValue', () => {
    it('should create an decimal literal when choosing Decimal datatype and clicking on create button', async () => {
        await setup();
        await clickOnAddButton(screen);
        const selectInput = screen.getByText('Resource');
        await selectEvent.openMenu(selectInput);
        await selectEvent.select(selectInput, ['Decimal']);
        fireEvent.change(screen.getByPlaceholderText(/enter a decimal/i), { target: { value: '1.5' } });
        fireEvent.click(screen.getByRole('button', { name: 'Create' }));
        await waitFor(() => expect(screen.getByText('1.5')).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText('Decimal')).toHaveAttribute('title', 'xsd:decimal'));
    });
});

describe('DataBrowser.AddValue', () => {
    it('should create an integer literal when choosing Integer datatype and clicking on create button', async () => {
        await setup();
        await clickOnAddButton(screen);
        const selectInput = screen.getByText('Resource');
        await selectEvent.openMenu(selectInput);
        await selectEvent.select(selectInput, ['Integer']);
        fireEvent.change(screen.getByPlaceholderText(/enter a integer/i), { target: { value: '1' } });
        fireEvent.click(screen.getByRole('button', { name: 'Create' }));
        await waitFor(() => expect(screen.getByText('1')).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText('Integer')).toHaveAttribute('title', 'xsd:integer'));
    });
});

describe('DataBrowser.AddValue', () => {
    it('should create a false boolean literal when choosing Boolean datatype and clicking on create button', async () => {
        await setup();
        await clickOnAddButton(screen);
        const selectInput = screen.getByText('Resource');
        await selectEvent.openMenu(selectInput);
        await selectEvent.select(selectInput, ['Boolean']);
        fireEvent.change(screen.getAllByRole('combobox')[1], { target: { value: 'false' } });
        fireEvent.click(screen.getByRole('button', { name: 'Create' }));
        await waitFor(() => expect(screen.getByLabelText('Cross mark')).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText('Boolean')).toHaveAttribute('title', 'xsd:boolean'));
    });
});

describe('DataBrowser.AddValue', () => {
    it('should create a true boolean literal when choosing Boolean datatype and clicking on create button', async () => {
        await setup();
        await clickOnAddButton(screen);
        const selectInput = screen.getByText('Resource');
        await selectEvent.openMenu(selectInput);
        await selectEvent.select(selectInput, ['Boolean']);
        fireEvent.change(screen.getAllByRole('combobox')[1], { target: { value: 'true' } });
        fireEvent.click(screen.getByRole('button', { name: 'Create' }));
        await waitFor(() => expect(screen.getByLabelText('Check mark')).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText('Boolean')).toHaveAttribute('title', 'xsd:boolean'));
    });
});

describe('DataBrowser.AddValue', () => {
    it('should create an date literal when choosing Date datatype and clicking on create button', async () => {
        await setup();
        await clickOnAddButton(screen);
        const selectInput = screen.getByText('Resource');
        await selectEvent.openMenu(selectInput);
        await selectEvent.select(selectInput, ['Date']);
        fireEvent.change(screen.getByPlaceholderText(/enter a date/i), { target: { value: '2021-11-10' } });
        fireEvent.click(screen.getByRole('button', { name: 'Create' }));
        await waitFor(() => expect(screen.getByText('2021-11-10')).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText('Date')).toHaveAttribute('title', 'xsd:date'));
    });
});

describe('DataBrowser.AddValue', () => {
    it('should create an uri literal when choosing URL datatype and clicking on create button', async () => {
        await setup();
        await clickOnAddButton(screen);
        const selectInput = screen.getByText('Resource');
        await selectEvent.openMenu(selectInput);
        await selectEvent.select(selectInput, ['URL']);
        fireEvent.change(screen.getByPlaceholderText(/enter a url/i), { target: { value: 'https://www.orkg.org/' } });
        fireEvent.click(screen.getByRole('button', { name: 'Create' }));
        await waitFor(() => expect(screen.getByText('https://www.orkg.org/')).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText('URL')).toHaveAttribute('title', 'xsd:anyURI'));
    });
});
