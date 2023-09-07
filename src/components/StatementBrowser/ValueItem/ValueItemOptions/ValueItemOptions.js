import { faCheck, faPen, faQuestionCircle, faSpinner, faTable, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import RDFDataCube from 'components/RDFDataCube/RDFDataCube';
import StatementActionButton from 'components/StatementBrowser/StatementActionButton/StatementActionButton';
import { CLASSES, ENTITIES } from 'constants/graphSettings';
import HELP_CENTER_ARTICLES from 'constants/helpCenterArticles';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Button } from 'reactstrap';
import { deleteStatementById } from 'services/backend/statements';
import {
    checkIfIsList,
    deleteValue,
    isValueHasFormattedLabel,
    setIsDeletingValue,
    setIsHelpModalOpen,
    toggleEditValue,
} from 'slices/statementBrowserSlice';
import { updateList } from 'services/backend/lists';
import InfoTippy from 'components/StatementBrowser/ValueItem/ValueItemOptions/InfoTippy';

const ValueItemOptions = ({ id, enableEdit, syncBackend, handleOnClick }) => {
    const value = useSelector(state => state.statementBrowser.values.byId[id]);
    const values = useSelector(state => state.statementBrowser.values);
    const resource = useSelector(state => state.statementBrowser.resources.byId[value.resourceId]);
    const property = useSelector(state => state.statementBrowser.properties.byId[resource.propertyId]);
    const hasFormattedLabel = useSelector(state => isValueHasFormattedLabel(state, id));
    const selectedResource = useSelector(state => state.statementBrowser.selectedResource);
    const isList = useSelector(state => checkIfIsList({ state, propertyId: resource.propertyId }));

    const dispatch = useDispatch();

    const [modalDataset, setModalDataset] = useState(false);

    const handleDeleteValue = async () => {
        if (syncBackend) {
            dispatch(setIsDeletingValue({ id, status: true }));

            const deletePromise = !isList
                ? deleteStatementById(value.statementId)
                : updateList({
                      id: selectedResource,
                      elements: property.valueIds.map(_id => values.byId[_id].resourceId).filter(_id => id !== _id),
                  });

            deletePromise
                .then(() => {
                    // dispatch(setIsDeletingValue({ id: id, status: false }));
                    toast.success('Statement deleted successfully');
                    dispatch(
                        deleteValue({
                            id,
                            propertyId: value.propertyId,
                        }),
                    );
                })
                .catch(() => {
                    dispatch(setIsDeletingValue({ id, status: false }));
                    toast.error('Something went wrong while deleting the value.');
                });
        } else {
            dispatch(
                deleteValue({
                    id,
                    propertyId: value.propertyId,
                }),
            );
        }
    };

    const handleDatasetClick = () => {
        setModalDataset(true);
    };

    return (
        <>
            {value.classes?.includes(CLASSES.QB_DATASET_CLASS) && (
                <>
                    {modalDataset && <RDFDataCube show={modalDataset} toggleModal={() => setModalDataset(prev => !prev)} id={id} />}
                    <StatementActionButton title="Visualize data in tabular form" icon={faTable} action={handleDatasetClick} />
                </>
            )}
            <div className="valueOptions">
                {enableEdit && (
                    <>
                        {!value.isSaving &&
                            ((resource && !resource.existingResourceId) || value.shared <= 1) &&
                            resource._class !== ENTITIES.PREDICATE &&
                            resource._class !== ENTITIES.CLASS && (
                                <StatementActionButton
                                    title="Edit value"
                                    testId={id}
                                    icon={faPen}
                                    isDisabled={value.isDeleting}
                                    action={hasFormattedLabel ? handleOnClick : () => dispatch(toggleEditValue({ id }))}
                                />
                            )}

                        {value.isSaving && (
                            <StatementActionButton isDisabled={true} title="Saving value" icon={faSpinner} iconSpin={true} action={() => null} />
                        )}
                        {resource?.existingResourceId && value.shared > 1 && (
                            <StatementActionButton
                                isDisabled={true}
                                interactive={true}
                                title={
                                    <>
                                        A shared resource cannot be edited directly{' '}
                                        <Button
                                            color="link"
                                            className="p-0"
                                            onClick={() =>
                                                dispatch(setIsHelpModalOpen({ isOpen: true, articleId: HELP_CENTER_ARTICLES.RESOURCE_SHARED }))
                                            }
                                        >
                                            <Icon icon={faQuestionCircle} />
                                        </Button>
                                    </>
                                }
                                icon={faPen}
                                action={() => null}
                            />
                        )}

                        {!value.isDeleting && (
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
                                        action: handleDeleteValue,
                                    },
                                    {
                                        title: 'Cancel',
                                        color: 'secondary',
                                        icon: faTimes,
                                    },
                                ]}
                            />
                        )}

                        {value.isDeleting && (
                            <StatementActionButton isDisabled={true} title="Deleting value" icon={faSpinner} iconSpin={true} action={() => null} />
                        )}
                    </>
                )}
                <InfoTippy id={id} />
            </div>
        </>
    );
};

ValueItemOptions.propTypes = {
    id: PropTypes.string.isRequired,
    enableEdit: PropTypes.bool.isRequired,
    syncBackend: PropTypes.bool.isRequired,
    handleOnClick: PropTypes.func,
    isListItem: PropTypes.bool,
};

export default ValueItemOptions;
