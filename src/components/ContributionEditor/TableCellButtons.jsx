import { faCheck, faPen, faQuestionCircle, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import { env } from 'next-runtime-env';
import PropTypes from 'prop-types';
import { memo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button } from 'reactstrap';
import styled from 'styled-components';

import ActionButton from '@/components/ActionButton/ActionButton';
import HELP_CENTER_ARTICLES from '@/constants/helpCenterArticles';
import { setIsHelpModalOpen } from '@/slices/contributionEditorSlice';

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

const TableCellButtons = ({ onEdit = null, onDelete = null, backgroundColor, style = {}, value }) => {
    const [disableHover, setDisableHover] = useState(false);
    const dispatch = useDispatch();
    const buttonClasses = classNames({
        'cell-buttons': true,
        disableHover,
    });

    return (
        <ButtonsContainer style={{ backgroundColor, ...style }} className={buttonClasses}>
            {onEdit && (value?.shared ?? 0) > 1 && (
                <ActionButton
                    isDisabled
                    interactive
                    appendTo={document.body}
                    title={
                        <>
                            A shared resource cannot be edited directly{' '}
                            <Button
                                color="link"
                                className="p-0"
                                onClick={() => dispatch(setIsHelpModalOpen({ isOpen: true, articleId: HELP_CENTER_ARTICLES.RESOURCE_SHARED }))}
                            >
                                <FontAwesomeIcon icon={faQuestionCircle} />
                            </Button>
                        </>
                    }
                    icon={faPen}
                    action={() => null}
                />
            )}
            {onEdit && (value?.shared ?? 0) <= 1 && (
                <ActionButton
                    appendTo={document.body}
                    title="Edit"
                    icon={faPen}
                    action={onEdit}
                    isDisabled={env('NEXT_PUBLIC_PWC_USER_ID') === value?.created_by}
                />
            )}

            <ActionButton
                title={onDelete ? 'Delete' : 'This item cannot be deleted'}
                icon={faTrash}
                appendTo={document.body}
                isDisabled={!onDelete}
                requireConfirmation
                confirmationMessage="Are you sure to delete?"
                confirmationButtons={[
                    {
                        title: 'Delete',
                        color: 'danger',
                        icon: faCheck,
                        action: onDelete,
                    },
                    {
                        title: 'Cancel',
                        color: 'secondary',
                        icon: faTimes,
                    },
                ]}
                open={disableHover}
                setOpen={setDisableHover}
            />
        </ButtonsContainer>
    );
};

TableCellButtons.propTypes = {
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    backgroundColor: PropTypes.string.isRequired,
    style: PropTypes.object,
    value: PropTypes.object,
};

export default memo(TableCellButtons);
