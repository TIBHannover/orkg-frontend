import React, { Component } from 'react';
import { Form, FormGroup, Label } from 'reactstrap';
import Tooltip from '../../Utils/Tooltip';
import ResearchProblemInput from './ResearchProblemInput';
import { StyledContribution } from './styled';
import StatementBrowser from '../../StatementBrowser/Statements';
import { connect } from 'react-redux';
import { updateResearchProblems, openTour } from '../../../actions/addPaper';
import PropTypes from 'prop-types';

class Contribution extends Component {
    handleResearchProblemsChange = (problemsArray, a) => {
        problemsArray = problemsArray ? problemsArray : [];
        this.props.updateResearchProblems({
            problemsArray,
            contributionId: this.props.id
        });
    };

    handleLearnMore = step => {
        this.props.openTour(step);
    };

    render() {
        return (
            <StyledContribution>
                <Form>
                    <FormGroup>
                        <Label>
                            <Tooltip
                                message={
                                    <span>
                                        Specify the research problems that this contribution addresses.{' '}
                                        <span style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => this.handleLearnMore(0)}>
                                            Learn more
                                        </span>
                                    </span>
                                }
                            >
                                Research problems
                            </Tooltip>
                        </Label>
                        <ResearchProblemInput handler={this.handleResearchProblemsChange} value={this.props.researchProblems} />
                    </FormGroup>
                    <FormGroup>
                        <Label>
                            <Tooltip
                                message={
                                    <span>
                                        Provide details about this contribution by making statements.{' '}
                                        <span style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => this.handleLearnMore(2)}>
                                            Learn more
                                        </span>
                                    </span>
                                }
                            >
                                Contribution data
                            </Tooltip>
                        </Label>

                        <StatementBrowser enableEdit={true} openExistingResourcesInDialog={true} syncBackend={false} />
                    </FormGroup>
                </Form>
            </StyledContribution>
        );
    }
}

Contribution.propTypes = {
    id: PropTypes.string.isRequired,
    updateResearchProblems: PropTypes.func.isRequired,
    researchProblems: PropTypes.array.isRequired,
    openTour: PropTypes.func.isRequired
};

const mapStateToProps = (state, ownProps) => {
    return {
        researchProblems: state.addPaper.contributions.byId[ownProps.id] ? state.addPaper.contributions.byId[ownProps.id].researchProblems : []
    };
};

const mapDispatchToProps = dispatch => ({
    updateResearchProblems: data => dispatch(updateResearchProblems(data)),
    openTour: data => dispatch(openTour(data))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Contribution);
