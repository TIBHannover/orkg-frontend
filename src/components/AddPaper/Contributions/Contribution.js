import React, { Component } from 'react';
import { Form, FormGroup, Label } from 'reactstrap';
import Tooltip from '../../Utils/Tooltip';
import ResearchProblemInput from './ResearchProblemInput';
import AddTemplateButton from './TemplateWizard/AddTemplateButton';
import TemplateWizard from './TemplateWizard/TemplateWizard';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { StyledHorizontalContribution } from './styled';
import { connect } from 'react-redux';
import { getStatementsByObject, getStatementsBySubject } from 'network';
import { updateResearchProblems, openTour } from '../../../actions/addPaper';
import PropTypes from 'prop-types';

class Contribution extends Component {
    state = {
        showVideoDialog: false,
        templates: [],
        isTemplatesLoading: false,
        isTemplatesFailesLoading: false
    };

    componentDidMount() {
        this.loadContirbutionTemplates();
    }

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

    loadContirbutionTemplates = () => {
        this.setState({ isTemplatesLoading: true, isTemplatesFailesLoading: false });
        getStatementsByObject({ id: this.props.selectedResearchField }).then(statements => {
            let contributionTemplates = statements.filter(statement =>
                statement.subject.classes.includes(process.env.REACT_APP_CLASSES_CONTRIBUTION_TEMPLATE)
            );
            Promise.all(
                contributionTemplates.map(contributionTemplate =>
                    getStatementsBySubject({ id: contributionTemplate.subject.id }).then(templateStaments => {
                        let templatePredicate = templateStaments
                            .filter(statement => statement.predicate.id === process.env.REACT_APP_TEMPLATE_OF_PREDICATE)
                            .map(statement => ({
                                id: statement.object.id,
                                label: statement.object.label
                            }));
                        return {
                            id: templateStaments.id,
                            predicateId: templatePredicate[0].id,
                            predicateLabel: templatePredicate[0].label,
                            label: contributionTemplate.subject.label,
                            properties: templateStaments
                                .filter(statement => statement.predicate.id === process.env.REACT_APP_TEMPLATE_PROPERTY)
                                .map(statement => ({
                                    id: statement.object.id,
                                    label: statement.object.label
                                }))
                        };
                    })
                )
            ).then(templates => {
                this.setState({
                    templates: templates,
                    isTemplatesLoading: false,
                    isTemplatesFailesLoading: false
                });
            });
        });
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
                            {this.state.isTemplatesLoading && (
                                <>
                                    <Icon icon={faSpinner} spin /> Loading contribution templates.
                                </>
                            )}
                            {!this.state.isTemplatesLoading && this.state.templates.length === 0 && <>No contribution template found.</>}
                            {!this.state.isTemplatesLoading && this.state.templates.length > 0 && (
                                <>
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
                                </>
                            )}
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
    selectedResearchField: PropTypes.string.isRequired,
    openTour: PropTypes.func.isRequired,
    resourceId: PropTypes.string
};

const mapStateToProps = (state, ownProps) => {
    return {
        resourceId: state.addPaper.contributions.byId[ownProps.id] ? state.addPaper.contributions.byId[ownProps.id].resourceId : null,
        researchProblems: state.addPaper.contributions.byId[ownProps.id] ? state.addPaper.contributions.byId[ownProps.id].researchProblems : [],
        selectedResearchField: state.addPaper.selectedResearchField
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
