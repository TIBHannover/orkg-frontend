import React, { Component } from 'react';
import { createResourceStatement, createResource, createLiteral, createLiteralStatement, createPredicate } from 'network';
import AddValueTemplate from './AddValueTemplate';
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
        const valueClassType =
            this.props.typeComponents &&
            this.props.typeComponents.length > 0 &&
            this.props.typeComponents[0].value &&
            this.props.typeComponents[0].value.id
                ? this.props.typeComponents[0].value
                : null;

        if (this.props.syncBackend) {
            const predicate = this.props.properties.byId[this.props.propertyId ? this.props.propertyId : this.props.selectedProperty];
            let newObject = null;
            let newStatement = null;
            switch (valueType) {
                case 'object':
                    newObject = await createResource(inputValue, valueClassType ? [valueClassType.id] : []);
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
                shared: newObject.shared,
                classes: valueClassType ? [valueClassType.id] : []
            });
        } else {
            const predicate = this.props.properties.byId[this.props.propertyId ? this.props.propertyId : this.props.selectedProperty];
            this.props.createValue({
                label: inputValue,
                type: valueType,
                propertyId: this.props.propertyId ? this.props.propertyId : this.props.selectedProperty,
                templateId: predicate.templateId ? predicate.templateId : null,
                classes: valueClassType ? [valueClassType.id] : [],
                shared: 1
            });
        }
    };

    render() {
        const predicate = this.props.properties.byId[this.props.propertyId ? this.props.propertyId : this.props.selectedProperty];

        return (
            <>
                <AddValueTemplate
                    predicate={predicate}
                    properties={this.props.properties}
                    propertyId={this.props.propertyId}
                    selectedProperty={this.props.selectedProperty}
                    handleValueSelect={this.handleValueSelect}
                    handleInputChange={this.handleInputChange}
                    newResources={this.props.newResources}
                    handleAddValue={this.handleAddValue}
                    typeComponents={this.props.typeComponents}
                />
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
    createProperty: PropTypes.func.isRequired,

    typeComponents: PropTypes.array.isRequired
};

AddValue.defaultProps = {
    contextStyle: 'StatementBrowser'
};
