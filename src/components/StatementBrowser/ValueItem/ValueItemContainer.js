import { connect } from 'react-redux';
import {
    selectResource,
    fetchStatementsForResource,
    fetchStructureForTemplate,
    deleteValue,
    toggleEditValue,
    updateValueLabel,
    createValue,
    createResource,
    doneSavingValue,
    isSavingValue,
    changeValue
} from 'actions/statementBrowser';
import ValueItem from './ValueItem';

const mapStateToProps = state => {
    return {
        resources: state.statementBrowser.resources,
        values: state.statementBrowser.values,
        properties: state.statementBrowser.properties,
        selectedProperty: state.statementBrowser.selectedProperty
    };
};

const mapDispatchToProps = dispatch => ({
    createValue: data => dispatch(createValue(data)),
    createResource: data => dispatch(createResource(data)),
    selectResource: data => dispatch(selectResource(data)),
    fetchStatementsForResource: data => dispatch(fetchStatementsForResource(data)),
    fetchStructureForTemplate: data => dispatch(fetchStructureForTemplate(data)),
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
