import { connect } from 'react-redux';
import {
    toggleEditPropertyLabel,
    changeProperty,
    isSavingProperty,
    doneSavingProperty,
    deleteProperty,
    getComponentsByResourceIDAndPredicateID,
    canAddValue,
    canDeleteProperty
} from 'actions/statementBrowser';
import StatementItem from './StatementItem';

const mapStateToProps = (state, props) => {
    return {
        selectedProperty: state.statementBrowser.selectedProperty,
        selectedResource: state.statementBrowser.selectedResource,
        properties: state.statementBrowser.properties,
        values: state.statementBrowser.values,
        propertiesAsLinks: state.statementBrowser.propertiesAsLinks,
        resources: state.statementBrowser.resources,
        templates: state.statementBrowser.templates,
        classes: state.statementBrowser.classes,
        components: getComponentsByResourceIDAndPredicateID(
            state,
            props.resourceId ? props.resourceId : state.statementBrowser.selectedResource,
            props.property.existingPredicateId
        ),
        canAddValue: canAddValue(state, props.resourceId ? props.resourceId : state.statementBrowser.selectedResource, props.id),
        canDeleteProperty: canDeleteProperty(state, props.resourceId ? props.resourceId : state.statementBrowser.selectedResource, props.id)
    };
};

const mapDispatchToProps = dispatch => ({
    deleteProperty: id => dispatch(deleteProperty(id)),
    toggleEditPropertyLabel: data => dispatch(toggleEditPropertyLabel(data)),
    changeProperty: data => dispatch(changeProperty(data)),
    isSavingProperty: data => dispatch(isSavingProperty(data)),
    doneSavingProperty: data => dispatch(doneSavingProperty(data))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(StatementItem);
