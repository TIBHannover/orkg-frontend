import { useState } from 'react';
import { Button } from 'reactstrap';
import { toggleEditValue } from 'actions/statementBrowser';
import { setIsHelpModalOpen, deleteValue, isValueHasFormattedLabel } from 'actions/statementBrowser';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTrash, faPen, faTable, faCheck, faTimes, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import StatementActionButton from 'components/StatementBrowser/StatementActionButton/StatementActionButton';
import { deleteStatementById } from 'services/backend/statements';
import { useDispatch, useSelector } from 'react-redux';
import { CLASSES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import HELP_CENTER_ARTICLES from 'constants/helpCenterArticles';
import RDFDataCube from 'components/RDFDataCube/RDFDataCube';
import { toast } from 'react-toastify';
import InfoTippy from './InfoTippy';

const ValueItemOptions = ({ id, enableEdit, syncBackend, handleOnClick }) => {
    const value = useSelector(state => state.statementBrowser.values.byId[id]);
    const resource = useSelector(state => state.statementBrowser.resources.byId[value.resourceId]);
    const hasFormattedLabel = useSelector(state => isValueHasFormattedLabel(state, id));

    const dispatch = useDispatch();

    const [modalDataset, setModalDataset] = useState(false);

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
                        {((resource && !resource.existingResourceId) || value.shared <= 1) && (
                            <StatementActionButton
                                title="Edit value"
                                icon={faPen}
                                action={hasFormattedLabel ? handleOnClick : () => dispatch(toggleEditValue({ id: id }))}
                            />
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

                        <InfoTippy id={id} />
                    </>
                )}
            </div>
        </>
    );
};

ValueItemOptions.propTypes = {
    id: PropTypes.string.isRequired,
    enableEdit: PropTypes.bool.isRequired,
    syncBackend: PropTypes.bool.isRequired,
    handleOnClick: PropTypes.func
};

export default ValueItemOptions;
