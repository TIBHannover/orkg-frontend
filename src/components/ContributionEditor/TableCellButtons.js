import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import StatementOptionButton from 'components/StatementBrowser/StatementOptionButton/StatementOptionButton';
import PropTypes from 'prop-types';
import { memo } from 'react';
import styled from 'styled-components';

const ButtonsContainer = styled.div`
    position: absolute;
    right: 0;
    top: -10px;
    padding: 6px;
    border-radius: 6px;
    display: none;
`;

const TableCellButtons = ({ onEdit, onDelete, backgroundColor, style }) => {
    return (
        <ButtonsContainer style={{ backgroundColor, ...style }} className="cell-buttons">
            <StatementOptionButton title="Edit" icon={faPen} action={onEdit} />
            <StatementOptionButton
                requireConfirmation={true}
                title="Delete"
                confirmationMessage="Are you sure to delete?"
                icon={faTrash}
                action={onDelete}
                appendTo={document.body}
            />
        </ButtonsContainer>
    );
};

TableCellButtons.propTypes = {
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    backgroundColor: PropTypes.string.isRequired,
    style: PropTypes.object
};

TableCellButtons.defaultProps = {
    style: {}
};

export default memo(TableCellButtons);
