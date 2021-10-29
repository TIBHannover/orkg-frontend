import { useState } from 'react';
import { deleteValue, toggleEditValue, updateValueLabel, isSavingValue, doneSavingValue, deleteProperty } from 'actions/statementBrowser';
import { Input } from 'reactstrap';
import { faTrash, faPen, faQuestion, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import StatementActionButton from 'components/StatementBrowser/StatementActionButton/StatementActionButton';
import { TemplateHeaderStyle } from 'components/StatementBrowser/styled';
import { deleteStatementById } from 'services/backend/statements';
import { updateResource } from 'services/backend/resources';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

export default function TemplateHeader(props) {
    const dispatch = useDispatch();
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

    return (
        <div>
            <TemplateHeaderStyle className="d-flex">
                <div className="flex-grow-1 mr-4">
                    {!props.value.isEditing ? (
                        <>
                            {props.value.label}{' '}
                            {props.enableEdit && (
                                <div className="headerOptions">
                                    <StatementActionButton
                                        title="Edit label"
                                        icon={faPen}
                                        action={() => dispatch(toggleEditValue({ id: props.id }))}
                                    />
                                    <StatementActionButton
                                        title="Delete the template with its statements"
                                        icon={faTrash}
                                        requireConfirmation={true}
                                        confirmationMessage="Are you sure to delete?"
                                        confirmationButtons={[
                                            {
                                                title: 'Delete',
                                                color: 'danger',
                                                icon: faCheck,
                                                action: handleDeleteTemplate
                                            },
                                            {
                                                title: 'Cancel',
                                                color: 'secondary',
                                                icon: faTimes
                                            }
                                        ]}
                                    />
                                </div>
                            )}
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
                    <StatementActionButton
                        title="A template is a defined structure of a contribution, this structure is mostly shared between papers in the same research field."
                        icon={faQuestion}
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
    syncBackend: PropTypes.bool.isRequired,
    enableEdit: PropTypes.bool.isRequired
};
