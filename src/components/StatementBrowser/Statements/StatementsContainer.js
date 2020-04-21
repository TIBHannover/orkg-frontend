import { connect } from 'react-redux';
import { compose } from 'redux';
import { withCookies } from 'react-cookie';
import { initializeWithoutContribution, initializeWithResource, createProperty } from 'actions/statementBrowser';
import Statements from './Statements';

const mapStateToProps = state => {
    return {
        level: state.statementBrowser.level,
        resources: state.statementBrowser.resources,
        properties: state.statementBrowser.properties,
        values: state.statementBrowser.values,
        classes: state.statementBrowser.classes,
        templates: state.statementBrowser.templates,
        isFetchingStatements: state.statementBrowser.isFetchingStatements,
        selectedResource: state.statementBrowser.selectedResource
    };
};

const mapDispatchToProps = dispatch => ({
    initializeWithoutContribution: data => dispatch(initializeWithoutContribution(data)),
    initializeWithResource: data => dispatch(initializeWithResource(data)),
    createProperty: data => dispatch(createProperty(data))
});

export default compose(
    connect(
        mapStateToProps,
        mapDispatchToProps
    ),
    withCookies
)(Statements);
