import { connect } from 'react-redux';
import { deleteValue, toggleEditValue, updateValueLabel, isSavingValue, doneSavingValue, deleteProperty } from 'actions/statementBrowser';
import TemplateHeader from './TemplateHeader';

const mapDispatchToProps = dispatch => ({
    toggleEditValue: data => dispatch(toggleEditValue(data)),
    deleteValue: data => dispatch(deleteValue(data)),
    deleteProperty: data => dispatch(deleteProperty(data)),
    updateValueLabel: data => dispatch(updateValueLabel(data)),
    isSavingValue: data => dispatch(isSavingValue(data)),
    doneSavingValue: data => dispatch(doneSavingValue(data))
});

export default connect(
    null,
    mapDispatchToProps
)(TemplateHeader);
