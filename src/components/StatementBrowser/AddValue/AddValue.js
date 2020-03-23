import React, { Component } from 'react';
import { createResourceStatement, createResource, createLiteral, createLiteralStatement, createPredicate } from 'network';
import AddValueTemplate from './AddValueTemplate';
import AddValueSB from './AddValueSB';
import PropTypes from 'prop-types';

export default class AddValue extends Component {
    handleValueSelect = async (valueType, { id, value, shared, classes }) => {
        if (this.props.syncBackend) {
            const predicate = this.props.properties.byId[this.props.propertyId ? this.props.propertyId : this.props.selectedProperty];
            const newStatement = await createResourceStatement(this.props.selectedResource, predicate.existingPredicateId, id);
            this.props.createValue({
                label: value,
                type: valueType,
                propertyId: this.props.propertyId ? this.props.propertyId : this.props.selectedProperty,
                classes: classes,
                existingResourceId: id,
                isExistingValue: true,
                statementId: newStatement.id,
                shared: shared
            });
        } else {
            this.props.createValue({
                label: value,
                type: valueType,
                propertyId: this.props.propertyId ? this.props.propertyId : this.props.selectedProperty,
                classes: classes,
                existingResourceId: id,
                isExistingValue: true,
                shared: shared
            });
        }
    };

    handleAddValue = async (valueType, inputValue) => {
        if (this.props.syncBackend) {
            const predicate = this.props.properties.byId[this.props.propertyId ? this.props.propertyId : this.props.selectedProperty];
            let newObject = null;
            let newStatement = null;
            switch (valueType) {
                case 'object':
                    newObject = await createResource(inputValue);
                    newStatement = await createResourceStatement(this.props.selectedResource, predicate.existingPredicateId, newObject.id);
                    break;
                case 'property':
                    newObject = await createPredicate(inputValue);
                    newStatement = await createResourceStatement(this.props.selectedResource, predicate.existingPredicateId, newObject.id);
                    break;
                default:
                    newObject = await createLiteral(inputValue);
                    newStatement = await createLiteralStatement(this.props.selectedResource, predicate.existingPredicateId, newObject.id);
            }
            this.props.createValue({
                label: inputValue,
                type: valueType,
                propertyId: this.props.propertyId ? this.props.propertyId : this.props.selectedProperty,
                existingResourceId: newObject.id,
                isExistingValue: true,
                statementId: newStatement.id,
                shared: newObject.shared
            });
        } else {
            const predicate = this.props.properties.byId[this.props.propertyId ? this.props.propertyId : this.props.selectedProperty];
            this.props.createValue({
                label: inputValue,
                type: valueType,
                propertyId: this.props.propertyId ? this.props.propertyId : this.props.selectedProperty,
                templateId: predicate.templateId ? predicate.templateId : null,
                classes: predicate.templateClass ? [predicate.templateClass] : [],
                shared: 1
            });
        }
    };

    render() {
        const predicate = this.props.properties.byId[this.props.propertyId ? this.props.propertyId : this.props.selectedProperty];

        return (
            <>
                {this.props.contextStyle === 'StatementBrowser' ? (
                    <AddValueSB
                        isProperty={[process.env.REACT_APP_TEMPLATE_COMPONENT_PROPERTY, process.env.REACT_APP_TEMPLATE_OF_PREDICATE].includes(
                            predicate.existingPredicateId
                        )}
                        predicate={predicate}
                        properties={this.props.properties}
                        propertyId={this.props.propertyId}
                        selectedProperty={this.props.selectedProperty}
                        handleValueSelect={this.handleValueSelect}
                        handleInputChange={this.handleInputChange}
                        newResources={this.props.newResources}
                        handleAddValue={this.handleAddValue}
                    />
                ) : (
                    <AddValueTemplate
                        predicate={predicate}
                        properties={this.props.properties}
                        propertyId={this.props.propertyId}
                        selectedProperty={this.props.selectedProperty}
                        handleValueSelect={this.handleValueSelect}
                        handleInputChange={this.handleInputChange}
                        newResources={this.props.newResources}
                        handleAddValue={this.handleAddValue}
                    />
                )}
            </>
        );
    }
}

AddValue.propTypes = {
    createValue: PropTypes.func.isRequired,
    selectedProperty: PropTypes.string.isRequired,
    propertyId: PropTypes.string,
    selectedResource: PropTypes.string.isRequired,
    newResources: PropTypes.array.isRequired,
    syncBackend: PropTypes.bool.isRequired,
    properties: PropTypes.object.isRequired,
    contextStyle: PropTypes.string.isRequired,
    createProperty: PropTypes.func.isRequired
};

AddValue.defaultProps = {
    contextStyle: 'StatementBrowser'
};
