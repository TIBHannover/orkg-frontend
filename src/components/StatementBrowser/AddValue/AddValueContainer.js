import { connect } from 'react-redux';
import {
    createProperty,
    createValue,
    fetchTemplatesofClassIfNeeded,
    selectResource,
    createRequiredPropertiesInResource
} from 'actions/statementBrowser';
import { prefillStatements } from 'actions/addPaper';
import { isLiteral, getValueClass } from './helpers/utils';
import AddValue from './AddValue';

const mapStateToProps = (state, props) => {
    const newResourcesList = [];

    for (const key in state.statementBrowser.resources.byId) {
        const resource = state.statementBrowser.resources.byId[key];

        if (!resource.existingResourceId && resource.label && resource.id) {
            newResourcesList.push({
                id: resource.id,
                label: resource.label,
                ...(resource.shared ? { shared: resource.shared } : {}),
                ...(resource.classes ? { classes: resource.classes } : {})
            });
        }
    }

    const predicate = state.statementBrowser.properties.byId[props.propertyId ? props.propertyId : props.selectedProperty];
    const valueClass = getValueClass(props.components);
    let isLiteralField = isLiteral(props.components);
    if (predicate.range) {
        isLiteralField = ['Date', 'Number', 'String'].includes(predicate.range.id) ? true : false;
    }

    return {
        selectedProperty: state.statementBrowser.selectedProperty,
        selectedResource: props.resourceId ? props.resourceId : state.statementBrowser.selectedResource,
        newResources: newResourcesList,
        properties: state.statementBrowser.properties,
        classes: state.statementBrowser.classes,
        openExistingResourcesInDialog: state.statementBrowser.openExistingResourcesInDialog,
        templates: state.statementBrowser.templates,
        isLiteral: isLiteralField,
        valueClass: valueClass ? valueClass : predicate.range ? predicate.range : null
    };
};

const mapDispatchToProps = dispatch => ({
    createValue: data => dispatch(createValue(data)),
    createProperty: data => dispatch(createProperty(data)),
    selectResource: data => dispatch(selectResource(data)),
    prefillStatements: data => dispatch(prefillStatements(data)),
    fetchTemplatesofClassIfNeeded: data => dispatch(fetchTemplatesofClassIfNeeded(data)),
    createRequiredPropertiesInResource: data => dispatch(createRequiredPropertiesInResource(data))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AddValue);
