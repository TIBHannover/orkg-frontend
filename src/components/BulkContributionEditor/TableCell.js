import TableCellValue from 'components/BulkContributionEditor/TableCellValue';
import TableCellValueCreate from 'components/BulkContributionEditor/TableCellValueCreate';
import { Item, ItemInner } from 'components/Comparison/TableCell';
import PropTypes from 'prop-types';
import { memo, useState } from 'react';

const TableCell = ({ values, contributionId, propertyId }) => {
    const [isHovering, setIsHovering] = useState(false);
    const [disableCreate, setDisableCreate] = useState(false);

    return (
        <Item className="position-relative">
            <ItemInner cellPadding={10} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
                {values.map((value, index) => {
                    if (Object.keys(value).length === 0) {
                        return null;
                    }
                    return <TableCellValue key={`value-${value.statementId}`} value={value} index={index} setDisableCreate={setDisableCreate} />;
                })}
                <TableCellValueCreate
                    isVisible={isHovering && !disableCreate}
                    contributionId={contributionId}
                    propertyId={propertyId}
                    isEmptyCell={values.length === 0}
                />
            </ItemInner>
        </Item>
    );
};

TableCell.propTypes = {
    values: PropTypes.array,
    contributionId: PropTypes.string.isRequired,
    propertyId: PropTypes.string.isRequired
};

export default memo(TableCell);
