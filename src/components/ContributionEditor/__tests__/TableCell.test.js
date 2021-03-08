import { render, screen } from 'testUtils';
import TableCell from '../TableCell';

const setup = () => {
    const label = 'resource label';
    const values = [
        {
            label,
            _class: 'resource',
            statementId: 'S1'
        }
    ];

    render(<TableCell values={values} contributionId="R1" propertyId="P1" />);

    return { label };
};

test('should render when no values are provided', () => {
    render(<TableCell values={[]} contributionId="R1" propertyId="P1" />);
});

test('should render a resource when provided as value', () => {
    const { label } = setup();
    expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
});

test('should render a literal when provided as value', () => {
    const { label } = setup();

    expect(screen.getByText(label)).toBeInTheDocument();
});

test('should render multiple cell values with different types', () => {
    const label1 = 'resource label 1';
    const label2 = 'resource label 2';
    const label3 = 'resource label 3';
    const label4 = 'resource label 4';

    const values = [
        {
            label: label1,
            _class: 'literal',
            statementId: 'S1'
        },
        {
            label: label2,
            _class: 'literal',
            statementId: 'S2'
        },
        {
            label: label3,
            _class: 'resource',
            statementId: 'S3'
        },
        {
            label: label4,
            _class: 'resource',
            statementId: 'S4'
        }
    ];

    render(<TableCell values={values} contributionId="R1" propertyId="P1" />);

    expect(screen.getByText(label1)).toBeInTheDocument();
    expect(screen.getByText(label2)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: label3 })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: label4 })).toBeInTheDocument();
});
