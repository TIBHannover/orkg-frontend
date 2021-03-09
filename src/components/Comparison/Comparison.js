import TableScrollContainer from 'components/Comparison/TableScrollContainer';
import ComparisonTable from 'components/Comparison/ComparisonTable';

const Comparison = props => {
    return (
        <TableScrollContainer>
            <ComparisonTable {...props} />
        </TableScrollContainer>
    );
};

export default Comparison;
