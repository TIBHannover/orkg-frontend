import { connect } from 'react-redux';
import {
    createProperty,
    createValue,
    fetchTemplatesofClassIfNeeded,
    selectResource,
    createRequiredPropertiesInResource
} from 'actions/statementBrowser';
import { isLiteral, getValueClass } from './helpers/utils';
import AddValue from './AddValue';

const mapStateToProps = (state, props) => {
    const newResourcesList = [];

    for (const key in state.statementBrowser.resources.byId) {
        const resource = state.statementBrowser.resources.byId[key];

        if (!resource.existingResourceId) {
            newResourcesList.push({
                id: resource.id,
                label: resource.label
            });
        }
    }

    const predicate = state.statementBrowser.properties.byId[props.propertyId ? props.propertyId : props.selectedProperty];
    const valueClass = getValueClass(props.components);

    return {
        selectedProperty: state.statementBrowser.selectedProperty,
        selectedResource: state.statementBrowser.selectedResource,
        newResources: newResourcesList,
        properties: state.statementBrowser.properties,
        classes: state.statementBrowser.classes,
        openExistingResourcesInDialog: state.statementBrowser.openExistingResourcesInDialog,
        templates: state.statementBrowser.templates,
        isLiteral: isLiteral(props.components),
        valueClass: valueClass ? valueClass : predicate.range ? predicate.range : null
    };
};

const mapDispatchToProps = dispatch => ({
    createValue: data => dispatch(createValue(data)),
    createProperty: data => dispatch(createProperty(data)),
    selectResource: data => dispatch(selectResource(data)),
    fetchTemplatesofClassIfNeeded: data => dispatch(fetchTemplatesofClassIfNeeded(data)),
    createRequiredPropertiesInResource: data => dispatch(createRequiredPropertiesInResource(data))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AddValue);
