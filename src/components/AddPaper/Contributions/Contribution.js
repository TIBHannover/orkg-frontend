import React, { Component } from 'react';
import { Form, FormGroup } from 'reactstrap';
import { connect } from 'react-redux';
import SuggestedTemplates from 'components/StatementBrowser/SuggestedTemplates/SuggestedTemplates';
import StatementBrowser from 'components/StatementBrowser/Statements/StatementsContainer';
import { updateResearchProblems, openTour } from 'actions/addPaper';
import { getReseachProblemsOfContribution } from 'actions/statementBrowser';
import { StyledHorizontalContribution } from './styled';
import PropTypes from 'prop-types';

class Contribution extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showVideoDialog: false
        };
    }

    handleLearnMore = step => {
        this.props.openTour(step);
    };

    render() {
        return (
            <StyledHorizontalContribution>
                <Form>
                    {/*<FormGroup>
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
                        </FormGroup>*/}

                    <>
                        {(this.props.selectedResource || this.props.resourceId) && (
                            <SuggestedTemplates
                                syncBackend={false}
                                selectedResource={this.props.selectedResource ? this.props.selectedResource : this.props.resourceId}
                                researchProblems={this.props.researchProblems}
                                researchField={this.props.selectedResearchField}
                            />
                        )}

                        <FormGroup>
                            <StatementBrowser
                                enableEdit={true}
                                syncBackend={false}
                                openExistingResourcesInDialog={false}
                                initialResourceId={this.props.resourceId}
                                templatesFound={false}
                            />
                        </FormGroup>
                    </>
                </Form>
            </StyledHorizontalContribution>
        );
    }
}

Contribution.propTypes = {
    id: PropTypes.string.isRequired,
    updateResearchProblems: PropTypes.func.isRequired,
    researchProblems: PropTypes.array.isRequired,
    selectedResearchField: PropTypes.string.isRequired,
    selectedResource: PropTypes.string,
    openTour: PropTypes.func.isRequired,
    resourceId: PropTypes.string
};

const mapStateToProps = (state, ownProps) => {
    return {
        resourceId: state.addPaper.contributions.byId[ownProps.id] ? state.addPaper.contributions.byId[ownProps.id].resourceId : null,
        researchProblems: getReseachProblemsOfContribution(
            state,
            state.addPaper.contributions.byId[ownProps.id] ? state.addPaper.contributions.byId[ownProps.id].resourceId : null
        ),
        selectedResearchField: state.addPaper.selectedResearchField,
        selectedResource: state.statementBrowser.selectedResource
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
