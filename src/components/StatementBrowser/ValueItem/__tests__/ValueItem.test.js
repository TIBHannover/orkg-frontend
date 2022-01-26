import { render, screen, fireEvent, waitForElementToBeRemoved } from 'testUtils';
import ValueItem from '../ValueItem';
import { statementBrowser1QBDataset } from '../__mocks__/StatementBrowserDataValueItem';

jest.mock('react-flip-move', () => ({ children }) => children);

const setup = (
    initialState = {},
    props = {
        id: 'e4030c32-4e15-ae2e-c6f9-687591cf617e',
        propertyId: '8bd2d009-b720-9efd-711e-f594330a2235',
        syncBackend: true,
        enableEdit: false
    }
) => {
    render(<ValueItem {...props} />, { initialState });
};

describe('ValueItem', () => {
    it('should show Dataset icon', async () => {
        const config = {
            id: 'e4030c32-4e15-ae2e-c6f9-687591cf617e',
            propertyId: '8bd2d009-b720-9efd-711e-f594330a2235',
            syncBackend: false,
            enableEdit: false
        };
        setup(statementBrowser1QBDataset, config);
        expect(screen.getByRole('button', { name: 'Visualize data in tabular form' })).toBeInTheDocument();
    });
});

describe('ValueItem', () => {
    it('should open Dataset modal', async () => {
        const config = {
            id: 'e4030c32-4e15-ae2e-c6f9-687591cf617e',
            propertyId: '8bd2d009-b720-9efd-711e-f594330a2235',
            syncBackend: false,
            enableEdit: false
        };
        setup(statementBrowser1QBDataset, config);
        fireEvent.click(screen.getByRole('button', { name: 'Visualize data in tabular form' }));
        expect(screen.getByText(/View dataset/i)).toBeInTheDocument();
        await waitForElementToBeRemoved(() => screen.queryByText(/Loading dataset/i));
        //DILS2018 technical evaluation of ORKG comparison service
        expect(screen.getByText(/0.00026 sec/i)).toBeInTheDocument();
        expect(screen.getByText(/Baseline/i)).toBeInTheDocument();
    });
});
