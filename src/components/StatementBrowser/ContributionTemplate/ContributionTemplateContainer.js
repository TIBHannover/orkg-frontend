import { canAddProperty, doneAnimation, getComponentsByResourceID } from 'actions/statementBrowser';
import ContributionTemplate from './ContributionTemplate';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { withCookies } from 'react-cookie';

const mapStateToProps = (state, props) => {
    return {
        properties: state.statementBrowser.properties,
        resources: state.statementBrowser.resources,
        classes: state.statementBrowser.classes,
        templates: state.statementBrowser.templates,
        components: getComponentsByResourceID(state, props.value.resourceId),
        canAddProperty: canAddProperty(state, props.value.resourceId)
    };
};

const mapDispatchToProps = dispatch => ({
    doneAnimation: data => dispatch(doneAnimation(data))
});

export default compose(
    connect(
        mapStateToProps,
        mapDispatchToProps
    ),
    withCookies
)(ContributionTemplate);
