import { Button } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash, faCheck, faTimes, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import StatementActionButton from 'components/StatementBrowser/StatementActionButton/StatementActionButton';
import HELP_CENTER_ARTICLES from 'constants/helpCenterArticles';
import { setIsHelpModalOpen } from 'slices/statementBrowserSlice';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { useState } from 'react';
import classNames from 'classnames';
import env from '@beam-australia/react-env';
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

const TableCellButtons = ({ onEdit, onDelete, backgroundColor, style, value }) => {
    const [disableHover, setDisableHover] = useState(false);
    const dispatch = useDispatch();
    const buttonClasses = classNames({
        'cell-buttons': true,
        disableHover: disableHover
    });

    return (
        <ButtonsContainer style={{ backgroundColor, ...style }} className={buttonClasses}>
            {onEdit && (value?.shared ?? 0) > 1 && (
                <StatementActionButton
                    isDisabled={true}
                    interactive={true}
                    appendTo={document.body}
                    title={
                        <>
                            A shared resource cannot be edited directly{' '}
                            <Button
                                color="link"
                                className="p-0"
                                onClick={() => dispatch(setIsHelpModalOpen({ isOpen: true, articleId: HELP_CENTER_ARTICLES.RESOURCE_SHARED }))}
                            >
                                <Icon icon={faQuestionCircle} />
                            </Button>
                        </>
                    }
                    icon={faPen}
                    action={() => null}
                />
            )}
            {onEdit && (value?.shared ?? 0) <= 1 && (
                <StatementActionButton
                    appendTo={document.body}
                    title="Edit"
                    icon={faPen}
                    action={onEdit}
                    isDisabled={env('PWC_USER_ID') === value?.created_by}
                />
            )}

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
    style: PropTypes.object,
    value: PropTypes.object
};

TableCellButtons.defaultProps = {
    style: {},
    onEdit: null,
    onDelete: null
};

export default memo(TableCellButtons);
