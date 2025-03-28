import selectEvent from 'react-select-event';

import DataBrowser from '@/components/DataBrowser/DataBrowser';
import { DataBrowserProps } from '@/components/DataBrowser/types/DataBrowserTypes';
import { createMSWLiteral, createMSWResource, createMSWStatement } from '@/services/mocks/helpers';
import { fireEvent, render, Screen, screen, waitFor } from '@/testUtils';

const VALUE_IDS = {
    Date: '2c9a364e-86e9-595c-deed-71c7e2b2ad75',
    Integer: '7b5e79ac-26e6-b05a-a99c-2e2e4ef61946',
    Decimal: 'a94f9585-1cb7-e9f5-9539-4cc90e1e0b91',
    Boolean: 'd39d45d1-3e27-3b6a-b2c6-5f5134bad8bd',
    Text: '5b790dfb-82e6-256e-8458-60d78bfa5d37',
    Resource: 'c1aae3c4-4b49-8e5f-7d3f-ba4f8725899b',
    URL: '1cf10225-1ef6-364e-b829-9797abbbc969',
};

const setup = async (
    props: DataBrowserProps = {
        id: 'R1',
        isEditMode: true,
    },
) => {
    createMSWLiteral({
        id: VALUE_IDS.Date,
        label: '2021-11-12',
        datatype: 'xsd:date',
    });
    createMSWLiteral({
        id: VALUE_IDS.Integer,
        label: '213',
        datatype: 'xsd:integer',
    });

    createMSWLiteral({
        id: VALUE_IDS.Decimal,
        label: '3.14',
        datatype: 'xsd:decimal',
    });

    createMSWLiteral({
        id: VALUE_IDS.Boolean,
        label: 'false',
        datatype: 'xsd:boolean',
    });

    createMSWLiteral({
        id: VALUE_IDS.Text,
        label: 'Lorem ipsum',
        datatype: 'xsd:string',
    });

    createMSWResource({
        id: VALUE_IDS.Resource,
        label: 'Lorem ipsum Resource',
    });

    createMSWLiteral({
        id: VALUE_IDS.URL,
        label: 'http://www.orkg.org',
        datatype: 'xsd:anyURI',
    });

    Object.values(VALUE_IDS).forEach((valueId) => {
        createMSWStatement({
            subject: 'R1',
            predicate: 'P1',
            object: valueId,
        });
    });
    render(<DataBrowser {...props} />);
    expect(await screen.findByText(/resource label 1/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByText(/property 1/i)).toHaveLength(8));
};

const clickOnEditValueButton = async (sc: Screen, valueId: string) => {
    const editButton = sc.getByTestId(valueId);
    await waitFor(() => expect(editButton).toBeInTheDocument());
    fireEvent.click(editButton);
    await waitFor(() => expect(sc.getByRole('button', { name: /Save/i })).toBeInTheDocument());
    expect(sc.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
};

describe('DataBrowser.EditActions', () => {
    it('should cancel editing on clicking Cancel', async () => {
        await setup();
        await clickOnEditValueButton(screen, VALUE_IDS.Date);
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        expect(screen.queryByText(/Cancel/i)).toBeNull();
        expect(screen.getByTestId(VALUE_IDS.Date)).toBeInTheDocument();
    });
});

describe('DataBrowser.EditActions', () => {
    it('should show edit form for date when editing a Date', async () => {
        await setup();
        await clickOnEditValueButton(screen, VALUE_IDS.Date);
        const inputForm = screen.getByPlaceholderText(/enter a Date/i);
        expect(inputForm).toHaveAttribute('type', 'date');
        expect(inputForm).toHaveValue('2021-11-12');
    });
});

describe('DataBrowser.EditActions', () => {
    it('should change value of date after editing a Date', async () => {
        await setup();
        await clickOnEditValueButton(screen, VALUE_IDS.Date);
        fireEvent.change(screen.getByPlaceholderText(/enter a Date/i), { target: { value: '2018-10-25' } });
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));
        await waitFor(() => expect(screen.getByText('2018-10-25')).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText('Date')).toHaveAttribute('title', 'xsd:date'));
    });
});

describe('DataBrowser.EditActions', () => {
    it('should show edit form for text when editing a Integer', async () => {
        await setup();
        await clickOnEditValueButton(screen, VALUE_IDS.Integer);
        const inputForm = screen.getByPlaceholderText(/enter a Integer/i);
        expect(inputForm).toBeInTheDocument();
        expect(inputForm).toHaveValue('213');
    });
});

describe('DataBrowser.EditActions', () => {
    it('should change value of integer after editing a Integer', async () => {
        await setup();
        await clickOnEditValueButton(screen, VALUE_IDS.Integer);
        fireEvent.change(screen.getByPlaceholderText(/enter a Integer/i), { target: { value: '1' } });
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));
        await waitFor(() => expect(screen.getByText('1')).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText('Integer')).toHaveAttribute('title', 'xsd:integer'));
    });
});

describe('DataBrowser.EditActions', () => {
    it('should show edit form for text when editing a Decimal', async () => {
        await setup();
        await clickOnEditValueButton(screen, VALUE_IDS.Decimal);
        const inputForm = screen.getByPlaceholderText(/enter a Decimal/i);
        expect(inputForm).toBeInTheDocument();
        expect(inputForm).toHaveValue('3.14');
    });
});

describe('DataBrowser.EditActions', () => {
    it('should change value of decimal after editing a Decimal', async () => {
        await setup();
        await clickOnEditValueButton(screen, VALUE_IDS.Decimal);
        fireEvent.change(screen.getByPlaceholderText(/enter a Decimal/i), { target: { value: '1.5' } });
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));
        await waitFor(() => expect(screen.getByText('1.5')).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText('Decimal')).toHaveAttribute('title', 'xsd:decimal'));
    });
});

describe('DataBrowser.EditActions', () => {
    it('should show edit form for text when editing a Text', async () => {
        await setup();
        await clickOnEditValueButton(screen, VALUE_IDS.Text);
        const inputForm = screen.getByPlaceholderText(/enter a Text/i);
        expect(inputForm).toBeInTheDocument();
        expect(inputForm).toHaveValue('Lorem ipsum');
    });
});

describe('DataBrowser.EditActions', () => {
    it('should change value of text after editing a Text', async () => {
        await setup();
        await clickOnEditValueButton(screen, VALUE_IDS.Text);
        fireEvent.change(screen.getByPlaceholderText(/enter a Text/i), { target: { value: 'Literal 1' } });
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));
        await waitFor(() => expect(screen.getByText('Literal 1')).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText('Text')).toHaveAttribute('title', 'xsd:string'));
    });
});

describe('DataBrowser.EditActions', () => {
    it('should show select form when editing a Boolean', async () => {
        await setup();
        await clickOnEditValueButton(screen, VALUE_IDS.Boolean);
        expect(screen.getAllByRole('combobox')).toHaveLength(2);
        expect(screen.getByRole('option', { name: 'False' })).toBeInTheDocument();
        // @ts-expect-error
        expect(screen.getByRole('option', { name: 'False' }).selected).toBe(true);
    });
});

describe('DataBrowser.EditActions', () => {
    it('should change value of boolean after editing a Boolean', async () => {
        await setup();
        await clickOnEditValueButton(screen, VALUE_IDS.Boolean);
        fireEvent.change(screen.getAllByRole('combobox')[1], { target: { value: 'true' } });
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));
        await waitFor(() => expect(screen.getByLabelText('Check mark')).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText('Boolean')).toHaveAttribute('title', 'xsd:boolean'));
    });
});

describe('DataBrowser.EditActions', () => {
    it('should show edit form for text when editing a URL', async () => {
        await setup();
        await clickOnEditValueButton(screen, VALUE_IDS.URL);
        const inputForm = screen.getByPlaceholderText(/enter a URL/i);
        expect(inputForm).toBeInTheDocument();
        expect(inputForm).toHaveValue('http://www.orkg.org');
    });
});

describe('DataBrowser.EditActions', () => {
    it('should change value of url after editing a URL', async () => {
        await setup();
        await clickOnEditValueButton(screen, VALUE_IDS.URL);
        await fireEvent.change(screen.getByPlaceholderText(/enter a URL/i), { target: { value: 'http://www.tib.eu' } });
        await fireEvent.click(screen.getByRole('button', { name: 'Save' }));
        await waitFor(() => expect(screen.getByText('http://www.tib.eu')).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText('URL')).toHaveAttribute('title', 'xsd:anyURI'));
    });
});

describe('DataBrowser.EditActions', () => {
    it('should change type of value after editing the type', async () => {
        await setup();
        await clickOnEditValueButton(screen, VALUE_IDS.URL);
        const selectInput = screen.getByText('URL');
        await selectEvent.openMenu(selectInput);
        await selectEvent.select(selectInput, 'Text');
        await waitFor(() => expect(screen.getByPlaceholderText(/enter a Text/i)).toBeInTheDocument());
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));
        await waitFor(() => expect(screen.getByText(/The value you entered looks like/i)).toBeInTheDocument());
        fireEvent.click(screen.getByRole('button', { name: 'Keep' }));
        await waitFor(() => expect(screen.getAllByText('Text')).toHaveLength(2));
        expect(screen.getByText('http://www.orkg.org')).toBeInTheDocument();
        expect(screen.queryByText('URL')).toBeNull();
    });
});

describe('DataBrowser.EditActions', () => {
    it('should change type of value after editing the type and value', async () => {
        await setup();
        await clickOnEditValueButton(screen, VALUE_IDS.Date);
        const selectInput = screen.getByText('Date');
        await selectEvent.openMenu(selectInput);
        await selectEvent.select(selectInput, ['Text']);
        fireEvent.change(screen.getByPlaceholderText(/enter a Text/i), { target: { value: 'New text' } });
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));
        await waitFor(() => expect(screen.getByText('New text')).toBeInTheDocument());
        expect(screen.getAllByText('Text')).toHaveLength(2);
        expect(screen.queryByText('Date')).toBeNull();
    });
});

describe('DataBrowser.EditActions', () => {
    it('should not show resource datatype on literal edit', async () => {
        await setup();
        await clickOnEditValueButton(screen, VALUE_IDS.Date);
        const selectInput = screen.getByText('Date');
        await selectEvent.openMenu(selectInput);
        expect(screen.queryAllByText(/Resource/i)).toHaveLength(2);
        await selectEvent.select(selectInput, ['Date']);
        expect(screen.getAllByText('Text')).toHaveLength(1);
        expect(screen.getAllByText('Date')).toHaveLength(1);
    });
});
