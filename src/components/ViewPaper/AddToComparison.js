import React, { Component } from 'react';
import { CustomInput } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withCookies } from 'react-cookie';
import dotProp from 'dot-prop-immutable';
import { compose } from 'redux';
import { addToComparison, removeFromComparison } from '../../actions/viewPaper';

class AddToComparison extends Component {

    componentDidUpdate(prevProps) {
        if (this.props.comparison !== prevProps.comparison) {
            this.props.cookies.set('comparison', this.props.comparison, { path: '/' });
        }
    }

    toggleCompare = () => {
        const { contributionId, comparison } = this.props;
        
        if (comparison.allIds.includes(contributionId)) {
            // delete the contribution from cookies
            let valueIndex = dotProp.get(this.props.comparison, 'allIds').indexOf(contributionId);
            let newComparison = dotProp.delete(this.props.comparison, `allIds.${valueIndex}`)
            newComparison = dotProp.delete(newComparison, `byId.${contributionId}`);
            this.props.cookies.set('comparison', newComparison, { path: '/' });

            this.props.removeFromComparison(contributionId);
        } else {
            let contributionData = {
                paperId: this.props.paperId,
                paperTitle: this.props.paperTitle,
                contributionTitle: this.props.contributionTitle,
            }
            // add the contribution to cookies
            let newComparison = dotProp.merge(this.props.comparison, `byId.${contributionId}`, contributionData);
            newComparison = dotProp.merge(this.props.comparison, 'allIds', contributionId);
            this.props.cookies.set('comparison', newComparison, { path: '/' });
            
            this.props.addToComparison({
                contributionId: contributionId,
                contributionData: contributionData
            });
        }
    }

    render() {
        return (
            <div className="float-right">
                <CustomInput
                    type="checkbox"
                    id={`addToComparsion${this.props.contributionId}`}
                    label="Add to comparison"
                    onChange={this.toggleCompare}
                    checked={this.props.comparison.allIds.includes(this.props.contributionId)}
                />
            </div>
        );
    }
}

AddToComparison.propTypes = {
    contributionId: PropTypes.string.isRequired,
    paperId: PropTypes.string.isRequired,
    paperTitle: PropTypes.string.isRequired,
    contributionTitle: PropTypes.string.isRequired,
    addToComparison: PropTypes.func.isRequired,
    removeFromComparison: PropTypes.func.isRequired,
    comparison: PropTypes.object.isRequired,
    cookies: PropTypes.object,
};

const mapStateToProps = state => ({
    comparison: state.viewPaper.comparison,
});

const mapDispatchToProps = dispatch => ({
    addToComparison: (data) => dispatch(addToComparison(data)),
    removeFromComparison: (data) => dispatch(removeFromComparison(data))
});

export default compose(
    connect(
        mapStateToProps,
        mapDispatchToProps
    ),
    withCookies
)(AddToComparison);