import React, { Component } from 'react';
import { createResourceStatement, createResource, createLiteral, createLiteralStatement, createPredicate } from 'network';
import AddValueTemplate from './AddValueTemplate';
import { guid } from 'utils';
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
        let newObject = null;
        let newStatement = null;
        const valueId = guid();
        const existingResourceId = guid();
        if (this.props.syncBackend) {
            const predicate = this.props.properties.byId[this.props.propertyId ? this.props.propertyId : this.props.selectedProperty];
            switch (valueType) {
                case 'object':
                    newObject = await createResource(inputValue, this.props.valueClass ? [this.props.valueClass.id] : []);
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
                classes: this.props.valueClass ? [this.props.valueClass.id] : []
            });
        } else {
            const predicate = this.props.properties.byId[this.props.propertyId ? this.props.propertyId : this.props.selectedProperty];

            this.props.createValue({
                valueId,
                label: inputValue,
                type: valueType,
                propertyId: this.props.propertyId ? this.props.propertyId : this.props.selectedProperty,
                existingResourceId,
                isExistingValue: false,
                templateId: predicate.templateId ? predicate.templateId : null,
                classes: this.props.valueClass ? [this.props.valueClass.id] : [],
                shared: 1
            });
        }
        return newObject ? newObject.id : existingResourceId;
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
                    fetchTemplatesofClassIfNeeded={this.props.fetchTemplatesofClassIfNeeded}
                    components={this.props.components}
                    classes={this.props.classes}
                    templates={this.props.templates}
                    selectResource={this.props.selectResource}
                    openExistingResourcesInDialog={this.props.openExistingResourcesInDialog}
                    isDisabled={this.props.isDisabled}
                    createRequiredPropertiesInResource={this.props.createRequiredPropertiesInResource}
                    isLiteral={this.props.isLiteral}
                    valueClass={this.props.valueClass}
                    isInlineResource={this.props.isInlineResource}
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
    openExistingResourcesInDialog: PropTypes.bool,
    selectResource: PropTypes.func.isRequired,
    fetchTemplatesofClassIfNeeded: PropTypes.func.isRequired,
    components: PropTypes.array.isRequired,
    classes: PropTypes.object.isRequired,
    templates: PropTypes.object.isRequired,
    isDisabled: PropTypes.bool.isRequired,
    createRequiredPropertiesInResource: PropTypes.func.isRequired,
    isLiteral: PropTypes.bool.isRequired,
    valueClass: PropTypes.object,
    isInlineResource: PropTypes.oneOfType([PropTypes.string, PropTypes.bool])
};

AddValue.defaultProps = {
    contextStyle: 'StatementBrowser',
    isDisabled: false
};
