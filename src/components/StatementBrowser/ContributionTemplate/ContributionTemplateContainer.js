import { doneAnimation } from 'actions/statementBrowser';
import ContributionTemplate from './ContributionTemplate';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { withCookies } from 'react-cookie';

const mapStateToProps = state => {
    return {
        properties: state.statementBrowser.properties,
        resources: state.statementBrowser.resources
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
