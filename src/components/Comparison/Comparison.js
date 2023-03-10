import TableScrollContainer from 'components/Comparison/Table/TableScrollContainer';
import ComparisonTable from 'components/Comparison/Table/ComparisonTable';

const Comparison = props => (
    <TableScrollContainer>
        <ComparisonTable {...props} />
    </TableScrollContainer>
);

export default Comparison;
