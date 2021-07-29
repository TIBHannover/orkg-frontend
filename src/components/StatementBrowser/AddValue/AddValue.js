import useAddValue from './hooks/useAddValue';
import AddValueView from './AddValueView';
import StatementBrowserDialog from 'components/StatementBrowser/StatementBrowserDialog';
import PropTypes from 'prop-types';

const AddValue = props => {
    const {
        modal,
        setModal,
        property,
        valueClass,
        isLiteralField,
        isBlankNode,
        isUniqLabel,
        inputDataType,
        inputValue,
        entityType,
        schema,
        setInputDataType,
        setEntityType,
        setInputValue,
        handleAddValue,
        getDataType,
        newResources,
        dialogResourceId,
        dialogResourceLabel,
        createBlankNode
    } = useAddValue({
        resourceId: props.resourceId,
        propertyId: props.propertyId,
        syncBackend: props.syncBackend
    });

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
            <AddValueView
                predicate={property}
                propertyId={props.propertyId}
                newResources={newResources}
                handleAddValue={handleAddValue}
                components={props.components}
                isDisabled={props.isDisabled}
                isLiteral={isLiteralField}
                valueClass={valueClass}
                isBlankNode={isBlankNode}
                isUniqLabel={isUniqLabel}
                createBlankNode={createBlankNode}
                inputDataType={inputDataType}
                inputValue={inputValue}
                entityType={entityType}
                setInputDataType={setInputDataType}
                setEntityType={setEntityType}
                setInputValue={setInputValue}
                schema={schema}
                getDataType={getDataType}
            />
        </>
    );
};

AddValue.propTypes = {
    propertyId: PropTypes.string,
    resourceId: PropTypes.string,
    syncBackend: PropTypes.bool.isRequired,
    components: PropTypes.array.isRequired,
    isDisabled: PropTypes.bool.isRequired
};

AddValue.defaultProps = {
    isDisabled: false
};

export default AddValue;
