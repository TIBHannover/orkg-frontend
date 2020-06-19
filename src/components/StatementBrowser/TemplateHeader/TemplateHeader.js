import React, { useState } from 'react';
import { Input } from 'reactstrap';
import { faTrash, faPen, faQuestion } from '@fortawesome/free-solid-svg-icons';
import StatementOptionButton from 'components/StatementBrowser/StatementOptionButton/StatementOptionButton';
import { TemplateHeaderStyle } from 'components/StatementBrowser/styled';
import { deleteStatementById, updateResource } from 'network';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default function TemplateHeader(props) {
    const [disableHover, setDisableHover] = useState(false);
    const [draftLabel, setDraftLabel] = useState(props.value.label);

    const commitChangeLabel = async () => {
        // Check if the user changed the label
        if (draftLabel !== props.value.label) {
            props.updateValueLabel({
                label: draftLabel,
                valueId: props.id
            });
            if (props.syncBackend) {
                props.isSavingValue({ id: props.id }); // To show the saving message instead of the value label
                if (props.resourceId) {
                    await updateResource(props.resourceId, props.value.label);
                    toast.success('Resource label updated successfully');
                }
                props.doneSavingValue({ id: props.id });
            }
        }
    };

    const handleDeleteTemplate = async () => {
        if (props.syncBackend) {
            await deleteStatementById(props.value.statementId);
            toast.success('Statement deleted successfully');
        }
        props.deleteValue({
            id: props.id,
            propertyId: props.propertyId
        });
        props.deleteProperty({
            id: props.propertyId,
            resourceId: props.resourceId
        });
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
                                <StatementOptionButton title="Edit label" icon={faPen} action={() => props.toggleEditValue({ id: props.id })} />
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
                                    props.toggleEditValue({ id: props.id });
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
    deleteValue: PropTypes.func.isRequired,
    deleteProperty: PropTypes.func.isRequired,
    value: PropTypes.object.isRequired,
    id: PropTypes.string.isRequired,
    resourceId: PropTypes.string.isRequired,
    propertyId: PropTypes.string.isRequired,
    statementId: PropTypes.string,
    syncBackend: PropTypes.bool.isRequired,
    toggleEditValue: PropTypes.func.isRequired,
    isSavingValue: PropTypes.func.isRequired,
    doneSavingValue: PropTypes.func.isRequired,
    updateValueLabel: PropTypes.func.isRequired
};
