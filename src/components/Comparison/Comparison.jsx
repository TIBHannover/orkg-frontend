import ComparisonTable from '@/components/Comparison/Table/ComparisonTable';
import TableScrollContainer from '@/components/Comparison/Table/TableScrollContainer';

const Comparison = (props) => (
    <TableScrollContainer>
        <ComparisonTable {...props} />
    </TableScrollContainer>
);

export default Comparison;
