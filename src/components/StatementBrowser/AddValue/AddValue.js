import { useState } from 'react';
import { ENTITIES } from 'constants/graphSettings';
import { useSelector } from 'react-redux';
import ValueForm from 'components/StatementBrowser/ValueForm/ValueForm';
import { ValueItemStyle } from 'components/StatementBrowser/styled';
import StatementActionButton from 'components/StatementBrowser/StatementActionButton/StatementActionButton';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons';
import StatementBrowserDialog from 'components/StatementBrowser/StatementBrowserDialog';
import PropTypes from 'prop-types';
import useAddValue from './hooks/useAddValue';

const AddValue = props => {
    const { modal, property, setModal, isBlankNode, entityType, dialogResourceId, dialogResourceLabel, createBlankNode } = useAddValue({
        resourceId: props.resourceId,
        propertyId: props.propertyId,
        syncBackend: props.syncBackend,
    });

    const [showAddValue, setShowAddValue] = useState(false);
    const isAddingValue = useSelector(state => state.statementBrowser.properties.byId[props.propertyId].isAddingValue ?? false);

    const [templateIsLoading] = useState(false); // to show loading indicator of the template if the value class has a template

    return (
        <>
            {modal && (
                <StatementBrowserDialog
                    show={modal}
                    toggleModal={() => setModal(prev => !prev)}
                    id={dialogResourceId}
                    label={dialogResourceLabel}
                    newStore={false}
                    enableEdit={true}
                />
            )}
            <ValueItemStyle className={showAddValue ? 'editingLabel' : ''}>
                {!showAddValue ? (
                    !templateIsLoading && !isAddingValue ? ( // Show loading indicator if the template is still loading
                        <StatementActionButton
                            isDisabled={props.isDisabled}
                            title={!props.isDisabled ? 'Add value' : 'This property reached the maximum number of values set by template'}
                            icon={faPlus}
                            action={() => {
                                if (isBlankNode && entityType !== ENTITIES.LITERAL) {
                                    createBlankNode(entityType);
                                } else {
                                    setShowAddValue(true);
                                }
                            }}
                            testId={`add-value-${property.existingPredicateId}-${Boolean(isBlankNode)}`}
                        />
                    ) : (
                        <span>
                            <Icon icon={faSpinner} spin />
                        </span>
                    )
                ) : (
                    <ValueForm
                        setShowAddValue={setShowAddValue}
                        showAddValue={showAddValue}
                        propertyId={props.propertyId}
                        resourceId={props.resourceId}
                        syncBackend={props.syncBackend}
                    />
                )}
            </ValueItemStyle>
        </>
    );
};

AddValue.propTypes = {
    id: PropTypes.string,
    propertyId: PropTypes.string,
    resourceId: PropTypes.string,
    syncBackend: PropTypes.bool.isRequired,
    isDisabled: PropTypes.bool.isRequired,
};

AddValue.defaultProps = {
    isDisabled: false,
};

export default AddValue;
