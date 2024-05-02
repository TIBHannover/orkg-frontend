import { useState } from 'react';
import { ENTITIES, PREDICATES } from 'constants/graphSettings';
import { useSelector } from 'react-redux';
import ValueForm from 'components/StatementBrowser/ValueForm/ValueForm';
import { ValueItemStyle } from 'components/StatementBrowser/styled';
import StatementActionButton from 'components/StatementBrowser/StatementActionButton/StatementActionButton';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons';
import StatementBrowserDialog from 'components/StatementBrowser/StatementBrowserDialog';
import PropTypes from 'prop-types';
import useAddValue from 'components/StatementBrowser/AddValue/hooks/useAddValue';
import SmartValueSuggestions from 'components/SmartSuggestions/SmartValueSuggestions';

const AddValue = ({ isDisabled = false, propertyId, resourceId, syncBackend }) => {
    const { modal, property, setModal, isBlankNode, entityType, dialogResourceId, dialogResourceLabel, createBlankNode, valueClass } = useAddValue({
        resourceId,
        propertyId,
        syncBackend,
    });

    const [showAddValue, setShowAddValue] = useState(false);
    const isAddingValue = useSelector((state) => state.statementBrowser.properties.byId[propertyId].isAddingValue ?? false);
    const paperTitle = useSelector((state) => state.viewPaper.title);
    const abstract = useSelector((state) => state.viewPaper.abstract);

    const [templateIsLoading] = useState(false); // to show loading indicator of the template if the value class has a template

    return (
        <>
            {modal && (
                <StatementBrowserDialog
                    show={modal}
                    toggleModal={() => setModal((prev) => !prev)}
                    id={dialogResourceId}
                    label={dialogResourceLabel}
                    newStore={false}
                    enableEdit
                />
            )}
            <ValueItemStyle className={showAddValue ? 'editingLabel' : ''}>
                {!showAddValue ? (
                    !templateIsLoading && !isAddingValue ? ( // Show loading indicator if the template is still loading
                        <>
                            <StatementActionButton
                                isDisabled={isDisabled}
                                title={!isDisabled ? 'Add value' : 'This property reached the maximum number of values set by template'}
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
                            {(property.existingPredicateId === PREDICATES.HAS_RESEARCH_PROBLEM ||
                                property.existingPredicateId === PREDICATES.METHOD ||
                                property.existingPredicateId === PREDICATES.MATERIAL) &&
                                paperTitle && (
                                    <SmartValueSuggestions
                                        paperTitle={paperTitle}
                                        abstract={abstract}
                                        propertyId={propertyId}
                                        resourceId={resourceId}
                                        classId={valueClass?.id ?? null}
                                    />
                                )}
                        </>
                    ) : (
                        <span>
                            <Icon icon={faSpinner} spin />
                        </span>
                    )
                ) : (
                    <ValueForm
                        setShowAddValue={setShowAddValue}
                        showAddValue={showAddValue}
                        propertyId={propertyId}
                        resourceId={resourceId}
                        syncBackend={syncBackend}
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

export default AddValue;
