import { faPen, faTrash, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import StatementActionButton from 'components/StatementBrowser/StatementActionButton/StatementActionButton';
import PropTypes from 'prop-types';
import { useState } from 'react';
import classNames from 'classnames';
import { memo } from 'react';
import styled from 'styled-components';

const ButtonsContainer = styled.div`
    position: absolute;
    right: 0;
    top: -10px;
    padding: 6px;
    border-radius: 6px;
    display: none;

    &.disableHover.cell-buttons {
        display: block;
    }
`;

const TableCellButtons = ({ onEdit, onDelete, backgroundColor, style }) => {
    const [disableHover, setDisableHover] = useState(false);

    const buttonClasses = classNames({
        'cell-buttons': true,
        disableHover: disableHover
    });

    return (
        <ButtonsContainer style={{ backgroundColor, ...style }} className={buttonClasses}>
            <StatementActionButton title={onEdit ? 'Edit' : 'This item cannot be edited'} icon={faPen} action={onEdit} isDisabled={!onEdit} />
            <StatementActionButton
                title={onDelete ? 'Delete' : 'This item cannot be deleted'}
                icon={faTrash}
                appendTo={document.body}
                isDisabled={!onDelete}
                requireConfirmation={true}
                confirmationMessage="Are you sure to delete?"
                confirmationButtons={[
                    {
                        title: 'Delete',
                        color: 'danger',
                        icon: faCheck,
                        action: onDelete
                    },
                    {
                        title: 'Cancel',
                        color: 'secondary',
                        icon: faTimes
                    }
                ]}
                onVisibilityChange={disable => setDisableHover(disable)}
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
