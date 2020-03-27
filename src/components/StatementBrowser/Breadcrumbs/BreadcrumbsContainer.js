import { connect } from 'react-redux';
import { goToResourceHistory } from 'actions/statementBrowser';
import Breadcrumbs from './Breadcrumbs';

const mapStateToProps = state => {
    return {
        resourceHistory: state.statementBrowser.resourceHistory,
        level: state.statementBrowser.level,
        selectedResource: state.statementBrowser.selectedResource,
        resources: state.statementBrowser.resources
    };
};

const mapDispatchToProps = dispatch => ({
    goToResourceHistory: data => dispatch(goToResourceHistory(data))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Breadcrumbs);
