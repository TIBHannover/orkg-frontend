import { connect } from 'react-redux';
import { createProperty, createValue, fetchTemplatesofClassIfNeeded, selectResource } from 'actions/statementBrowser';
import AddValue from './AddValue';

const mapStateToProps = state => {
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

    return {
        selectedProperty: state.statementBrowser.selectedProperty,
        selectedResource: state.statementBrowser.selectedResource,
        newResources: newResourcesList,
        properties: state.statementBrowser.properties,
        classes: state.statementBrowser.classes,
        templates: state.statementBrowser.templates
    };
};

const mapDispatchToProps = dispatch => ({
    createValue: data => dispatch(createValue(data)),
    createProperty: data => dispatch(createProperty(data)),
    selectResource: data => dispatch(selectResource(data)),
    fetchTemplatesofClassIfNeeded: data => dispatch(fetchTemplatesofClassIfNeeded(data))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AddValue);
