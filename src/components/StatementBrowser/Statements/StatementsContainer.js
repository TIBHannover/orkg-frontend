import { connect } from 'react-redux';
import { compose } from 'redux';
import { withCookies } from 'react-cookie';
import { initializeWithoutContribution, initializeWithResource, updateSettings } from 'actions/statementBrowser';
import Statements from './Statements';

const mapStateToProps = state => {
    return {
        level: state.statementBrowser.level,
        resources: state.statementBrowser.resources,
        properties: state.statementBrowser.properties,
        values: state.statementBrowser.values,
        isFetchingStatements: state.statementBrowser.isFetchingStatements,
        selectedResource: state.statementBrowser.selectedResource
    };
};

const mapDispatchToProps = dispatch => ({
    initializeWithoutContribution: data => dispatch(initializeWithoutContribution(data)),
    initializeWithResource: data => dispatch(initializeWithResource(data)),
    updateSettings: data => dispatch(updateSettings(data))
});

export default compose(
    connect(
        mapStateToProps,
        mapDispatchToProps
    ),
    withCookies
)(Statements);
