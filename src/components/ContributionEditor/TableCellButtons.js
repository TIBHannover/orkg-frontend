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
            <StatementOptionButton title={onEdit ? 'Edit' : 'This item cannot be edited'} icon={faPen} action={onEdit} isDisabled={!onEdit} />
            <StatementOptionButton
                requireConfirmation={true}
                title={onDelete ? 'Delete' : 'This item cannot be deleted'}
                confirmationMessage="Are you sure to delete?"
                icon={faTrash}
                appendTo={document.body}
                isDisabled={!onDelete}
                action={onDelete}
            />
        </ButtonsContainer>
    );
};

TableCellButtons.propTypes = {
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    backgroundColor: PropTypes.string.isRequired,
    style: PropTypes.object
};

TableCellButtons.defaultProps = {
    style: {},
    onEdit: null,
    onDelete: null
};

export default memo(TableCellButtons);
