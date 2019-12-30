import React, { Component } from 'react';
import { Form, FormGroup, Label } from 'reactstrap';
import Tooltip from '../../Utils/Tooltip';
import ResearchProblemInput from './ResearchProblemInput';
import AddTemplateButton from './TemplateWizard/AddTemplateButton';
import TemplateWizard from './TemplateWizard/TemplateWizard';
import { StyledHorizontalContribution } from './styled';
import { connect } from 'react-redux';
import { updateResearchProblems, openTour } from '../../../actions/addPaper';
import PropTypes from 'prop-types';

class Contribution extends Component {
    state = {
        showVideoDialog: false,
        templates: [
            {
                id: 1,
                predicateId: 'HAS_IMPLEMENTATION',
                predicateLabel: 'Has implementation',
                label: 'Implementation',
                properties: [
                    {
                        id: 'P21',
                        label: 'programming language'
                    },
                    {
                        id: 'P1003',
                        label: 'Uses Library'
                    },
                    {
                        id: 'P2000',
                        label: 'Dataset'
                    }
                ]
            },
            {
                id: 2,
                predicateId: 'HAS_EVALUATION',
                predicateLabel: 'Has evaluation',
                label: 'Evaluation',
                properties: [
                    {
                        id: 'P2001',
                        label: 'Type'
                    },
                    {
                        id: 'P2002',
                        label: 'Participants'
                    },
                    {
                        id: 'P2000',
                        label: 'Dataset'
                    }
                ]
            },
            {
                id: 3,
                predicateId: 'HAS_APPROACH',
                predicateLabel: 'Has approach',
                label: 'Approach',
                properties: []
            },
            {
                id: 4,
                predicateId: 'HAS_RESULTS',
                predicateLabel: 'Has result',
                label: 'Results',
                properties: []
            },
            {
                id: 5,
                predicateId: 'HAS_METHOD',
                predicateLabel: 'Has method',
                label: 'Method',
                properties: []
            }
        ]
    };

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
            <StyledHorizontalContribution>
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
                        <Label className="mb-0">
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
                                Data
                            </Tooltip>
                        </Label>
                        <TemplateWizard
                            enableEdit={true}
                            openExistingResourcesInDialog={true}
                            syncBackend={false}
                            initialResourceId={this.props.resourceId}
                        />
                        <Label className={'mt-4'}>
                            <Tooltip message={`Select a template to use it in your contribution data`}>Add template</Tooltip>
                        </Label>
                        <div className={'mt-2'}>
                            {this.state.templates.map(t => (
                                <AddTemplateButton
                                    key={`t${t.id}`}
                                    label={t.label}
                                    predicateId={t.predicateId}
                                    predicateLabel={t.predicateLabel}
                                    properties={t.properties}
                                    selectedResource={this.props.resourceId}
                                />
                            ))}
                        </div>
                    </FormGroup>
                </Form>
            </StyledHorizontalContribution>
        );
    }
}

Contribution.propTypes = {
    id: PropTypes.string.isRequired,
    updateResearchProblems: PropTypes.func.isRequired,
    researchProblems: PropTypes.array.isRequired,
    openTour: PropTypes.func.isRequired,
    resourceId: PropTypes.string.isRequired
};

const mapStateToProps = (state, ownProps) => {
    return {
        resourceId: state.addPaper.contributions.byId[ownProps.id] ? state.addPaper.contributions.byId[ownProps.id].resourceId : null,
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
