import { useState } from 'react';
import { toggleEditValue } from 'actions/statementBrowser';
import { selectResource, fetchStatementsForResource, deleteValue, createResource, isValueHasFormattedLabel } from 'actions/statementBrowser';
import { faTrash, faPen, faTable, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import StatementActionButton from 'components/StatementBrowser/StatementActionButton/StatementActionButton';
import { deleteStatementById } from 'services/backend/statements';
import { useDispatch, useSelector } from 'react-redux';
import { CLASSES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import RDFDataCube from 'components/RDFDataCube/RDFDataCube';
import { toast } from 'react-toastify';
import InfoTippy from './InfoTippy';

const ValueItemOptions = ({ id, enableEdit, syncBackend, handleOnClick }) => {
    const value = useSelector(state => state.statementBrowser.values.byId[id]);
    const resource = useSelector(state => state.statementBrowser.resources.byId[value.resourceId]);
    const property = useSelector(state => state.statementBrowser.properties.byId[value.propertyId]);

    const hasFormattedLabel = useSelector(state => isValueHasFormattedLabel(state, id));

    const dispatch = useDispatch();

    const [modalDataset, setModalDataset] = useState(false);
    const [dialogResourceId, setDialogResourceId] = useState(null);
    const [dialogResourceLabel, setDialogResourceLabel] = useState(null);

    const handleDeleteValue = async () => {
        if (syncBackend) {
            await deleteStatementById(value.statementId);
            toast.success('Statement deleted successfully');
        }
        dispatch(
            deleteValue({
                id: id,
                propertyId: value.propertyId
            })
        );
    };

    const handleDatasetClick = () => {
        const existingResourceId = resource.existingResourceId;

        setModalDataset(true);
        setDialogResourceId(existingResourceId);
        setDialogResourceLabel(resource.label);
    };

    const handleDatasetResourceClick = resource => {
        dispatch(
            createResource({
                label: resource.rlabel ? resource.rlabel : resource.label,
                existingResourceId: resource.id,
                resourceId: resource.id
            })
        );

        dispatch(
            selectResource({
                increaseLevel: true,
                resourceId: resource.id,
                label: resource.rlabel ? resource.rlabel : resource.label,
                propertyLabel: property?.label
            })
        );

        dispatch(
            fetchStatementsForResource({
                resourceId: resource.id
            })
        );
    };

    return (
        <div className="valueOptions">
            {!value.isEditing && value.classes && value.classes.includes(CLASSES.QB_DATASET_CLASS) && (
                <StatementActionButton title="Visualize data in tabular form" icon={faTable} action={handleDatasetClick} />
            )}

            {enableEdit && (
                <>
                    {((resource && !resource.existingResourceId) || value.shared <= 1) && (
                        <StatementActionButton
                            title="Edit value"
                            icon={faPen}
                            action={hasFormattedLabel ? handleOnClick : () => dispatch(toggleEditValue({ id: id }))}
                        />
                    )}

                    {resource && resource.existingResourceId && value.shared > 1 && (
                        <StatementActionButton
                            isDisabled={true}
                            title="A shared resource cannot be edited directly"
                            icon={faPen}
                            action={() => null}
                        />
                    )}

                    <StatementActionButton
                        title="Delete value"
                        icon={faTrash}
                        action={handleDeleteValue}
                        requireConfirmation={true}
                        confirmationMessage="Are you sure to delete?"
                        confirmationButtons={[
                            {
                                title: 'Delete',
                                color: 'danger',
                                icon: faCheck,
                                action: handleDeleteValue
                            },
                            {
                                title: 'Cancel',
                                color: 'secondary',
                                icon: faTimes
                            }
                        ]}
                    />

                    {resource && <InfoTippy id={id} />}
                </>
            )}
            {modalDataset && (
                <RDFDataCube
                    show={modalDataset}
                    handleResourceClick={handleDatasetResourceClick}
                    toggleModal={() => setModalDataset(prev => !prev)}
                    resourceId={dialogResourceId}
                    resourceLabel={dialogResourceLabel}
                />
            )}
        </div>
    );
};

ValueItemOptions.propTypes = {
    id: PropTypes.string.isRequired,
    enableEdit: PropTypes.bool.isRequired,
    syncBackend: PropTypes.bool.isRequired,
    handleOnClick: PropTypes.func
};

export default ValueItemOptions;
