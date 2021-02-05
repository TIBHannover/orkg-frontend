import useBulkContributionEditor from 'components/BulkContributionEditor/hooks/useBulkContributionEditor';
import TableCellValueButtons from 'components/BulkContributionEditor/TableCellButtons';
import { Contribution, ItemHeader, ItemHeaderInner } from 'components/Comparison/styled';
import PropTypes from 'prop-types';
import { useState } from 'react';

const TableHeaderColumn = ({ contribution }) => {
    const [isHovering, setIsHovering] = useState(false);
    const { handleRemoveContribution } = useBulkContributionEditor();

    return (
        <ItemHeader key={contribution.id} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
            <ItemHeaderInner className="position-relative">
                {contribution.title ? contribution.title : <em>No title</em>}
                <br />
                <Contribution>
                    {contribution.year && `${contribution.year} - `}
                    {contribution.contributionLabel}
                </Contribution>
                <TableCellValueButtons
                    isHovering={isHovering}
                    onEdit={() => {}}
                    onDelete={() => handleRemoveContribution(contribution.id)}
                    backgroundColor="rgba(232, 97, 97, 0.8)"
                    style={{ top: 0, borderTopRightRadius: 10 }}
                />
            </ItemHeaderInner>
        </ItemHeader>
    );
};

TableHeaderColumn.propTypes = {
    contribution: PropTypes.object
};

export default TableHeaderColumn;
