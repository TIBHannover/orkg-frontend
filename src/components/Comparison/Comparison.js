import TableScrollContainer from 'components/Comparison/TableScrollContainer';
import ComparisonTable from 'components/Comparison/ComparisonTable';

const Comparison = props => (
    <TableScrollContainer>
        <ComparisonTable {...props} />
    </TableScrollContainer>
);

export default Comparison;
