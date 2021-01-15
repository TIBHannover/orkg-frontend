import React, { useState } from 'react';
import { deleteValue, toggleEditValue, updateValueLabel, isSavingValue, doneSavingValue, deleteProperty } from 'actions/statementBrowser';
import { Input } from 'reactstrap';
import { faTrash, faPen, faQuestion } from '@fortawesome/free-solid-svg-icons';
import StatementOptionButton from 'components/StatementBrowser/StatementOptionButton/StatementOptionButton';
import { TemplateHeaderStyle } from 'components/StatementBrowser/styled';
import { deleteStatementById } from 'services/backend/statements';
import { updateResource } from 'services/backend/resources';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default function TemplateHeader(props) {
    const dispatch = useDispatch();
    const [disableHover, setDisableHover] = useState(false);
    const [draftLabel, setDraftLabel] = useState(props.value.label);

    const commitChangeLabel = async () => {
        // Check if the user changed the label
        if (draftLabel !== props.value.label) {
            dispatch(
                updateValueLabel({
                    label: draftLabel,
                    valueId: props.id
                })
            );
            if (props.syncBackend) {
                dispatch(isSavingValue({ id: props.id })); // To show the saving message instead of the value label
                if (props.resourceId) {
                    await updateResource(props.resourceId, props.value.label);
                    toast.success('Resource label updated successfully');
                }
                dispatch(doneSavingValue({ id: props.id }));
            }
        }
    };

    const handleDeleteTemplate = async () => {
        if (props.syncBackend) {
            await deleteStatementById(props.value.statementId);
            toast.success('Statement deleted successfully');
        }
        dispatch(
            deleteValue({
                id: props.id,
                propertyId: props.propertyId
            })
        );
        dispatch(
            deleteProperty({
                id: props.propertyId,
                resourceId: props.resourceId
            })
        );
    };

    const headerClasses = classNames({
        headerOptions: true,
        disableHover: disableHover
    });

    return (
        <div>
            <TemplateHeaderStyle className="d-flex">
                <div className="flex-grow-1 mr-4">
                    {!props.value.isEditing ? (
                        <>
                            {props.value.label}{' '}
                            <div className={headerClasses}>
                                <StatementOptionButton title="Edit label" icon={faPen} action={() => dispatch(toggleEditValue({ id: props.id }))} />
                                <StatementOptionButton
                                    requireConfirmation={true}
                                    confirmationMessage="Are you sure to delete?"
                                    title="Delete the template with its statements"
                                    icon={faTrash}
                                    action={handleDeleteTemplate}
                                    onVisibilityChange={disable => setDisableHover(disable)}
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <Input
                                value={draftLabel}
                                onChange={e => setDraftLabel(e.target.value)}
                                onKeyDown={e => (e.keyCode === 13 || e.keyCode === 27) && e.target.blur()} // stop editing on enter and escape
                                onBlur={e => {
                                    commitChangeLabel();
                                    dispatch(toggleEditValue({ id: props.id }));
                                }}
                                autoFocus
                            />
                        </>
                    )}
                </div>
                <div className="type">
                    Template{' '}
                    <StatementOptionButton
                        title="A template is a defined structure of a contribution, this stucture is mostly shared between papers in the same research field."
                        icon={faQuestion}
                        iconWrapperSize="20px"
                        iconSize="10px"
                        action={() => null}
                    />
                </div>
            </TemplateHeaderStyle>
        </div>
    );
}

TemplateHeader.propTypes = {
    value: PropTypes.object.isRequired,
    id: PropTypes.string.isRequired,
    resourceId: PropTypes.string.isRequired,
    propertyId: PropTypes.string.isRequired,
    statementId: PropTypes.string,
    syncBackend: PropTypes.bool.isRequired
};
