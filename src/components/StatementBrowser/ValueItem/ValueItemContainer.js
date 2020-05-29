import { connect } from 'react-redux';
import {
    selectResource,
    fetchStatementsForResource,
    deleteValue,
    toggleEditValue,
    updateValueLabel,
    createResource,
    doneSavingValue,
    isSavingValue,
    changeValue
} from 'actions/statementBrowser';
import { getValueClass, isInlineResource } from 'components/StatementBrowser/AddValue/helpers/utils';
import ValueItem from './ValueItem';

const mapStateToProps = (state, props) => {
    return {
        resources: state.statementBrowser.resources,
        values: state.statementBrowser.values,
        properties: state.statementBrowser.properties,
        selectedProperty: state.statementBrowser.selectedProperty,
        openExistingResourcesInDialog: state.statementBrowser.openExistingResourcesInDialog,
        resourcesAsLinks: state.statementBrowser.resourcesAsLinks,
        classes: state.statementBrowser.classes,
        templates: state.statementBrowser.templates,
        valueClass: getValueClass(props.components),
        isInlineResource: isInlineResource(state, props.components)
    };
};

const mapDispatchToProps = dispatch => ({
    createResource: data => dispatch(createResource(data)),
    selectResource: data => dispatch(selectResource(data)),
    fetchStatementsForResource: data => dispatch(fetchStatementsForResource(data)),
    deleteValue: data => dispatch(deleteValue(data)),
    toggleEditValue: data => dispatch(toggleEditValue(data)),
    updateValueLabel: data => dispatch(updateValueLabel(data)),
    isSavingValue: data => dispatch(isSavingValue(data)),
    doneSavingValue: data => dispatch(doneSavingValue(data)),
    changeValue: data => dispatch(changeValue(data))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ValueItem);
