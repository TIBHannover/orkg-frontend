import TableCellValue from 'components/BulkContributionEditor/TableCellValue';
import TableCellValueCreate from 'components/BulkContributionEditor/TableCellValueCreate';
import { Item, ItemInner } from 'components/Comparison/TableCell';
import PropTypes from 'prop-types';
import { useState } from 'react';

const TableCell = ({ values }) => {
    const [isHovering, setIsHovering] = useState(false);
    const [disableCreate, setDisableCreate] = useState(false);

    return (
        <Item>
            <ItemInner cellPadding={1} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
                {values.map((value, index) => {
                    if (Object.keys(value).length === 0) {
                        return <div key={`value-${index}`} style={{ paddingTop: 20 }} />;
                    }
                    return <TableCellValue key={`value-${index}`} value={value} index={index} setDisableCreate={setDisableCreate} />;
                })}
                <TableCellValueCreate isVisible={isHovering && !disableCreate} />
            </ItemInner>
        </Item>
    );
};

TableCell.propTypes = {
    values: PropTypes.array
};

export default TableCell;
