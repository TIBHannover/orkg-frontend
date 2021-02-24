import { Component } from 'react';
import { Form, FormGroup } from 'reactstrap';
import { connect } from 'react-redux';
import SuggestedTemplates from 'components/StatementBrowser/SuggestedTemplates/SuggestedTemplates';
import StatementBrowser from 'components/StatementBrowser/StatementBrowser';
import { updateResearchProblems, openTour } from 'actions/addPaper';
import { getResearchProblemsOfContribution } from 'actions/statementBrowser';
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
        let shared = 1;
        if (Object.keys(this.props.resources.byId).length !== 0 && (this.props.selectedResource || this.props.resourceId)) {
            if (this.props.resources.byId[this.props.selectedResource ? this.props.selectedResource : this.props.resourceId]) {
                shared = this.props.resources.byId[this.props.selectedResource ? this.props.selectedResource : this.props.resourceId].shared;
            } else {
                shared = 0;
            }
        }

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
                                disabled={shared > 1 ? true : false}
                            />
                        )}

                        <FormGroup>
                            <StatementBrowser
                                enableEdit={true}
                                syncBackend={false}
                                openExistingResourcesInDialog={false}
                                initialSubjectId={this.props.resourceId}
                                initialSubjectLabel={this.props.resourceLabel}
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
    resourceLabel: PropTypes.string,
    openTour: PropTypes.func.isRequired,
    resourceId: PropTypes.string,
    resources: PropTypes.object.isRequired
};

const mapStateToProps = (state, ownProps) => {
    return {
        resourceId: state.addPaper.contributions.byId[ownProps.id] ? state.addPaper.contributions.byId[ownProps.id].resourceId : null,
        resourceLabel: state.addPaper.contributions.byId[ownProps.id] ? state.addPaper.contributions.byId[ownProps.id].label : null,
        researchProblems: getResearchProblemsOfContribution(
            state,
            state.addPaper.contributions.byId[ownProps.id] ? state.addPaper.contributions.byId[ownProps.id].resourceId : null
        ),
        selectedResearchField: state.addPaper.selectedResearchField,
        selectedResource: state.statementBrowser.selectedResource,
        resources: state.statementBrowser.resources
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
