import { Component } from 'react';
import { Alert, Col, Container, Form, FormGroup, Row, Button } from 'reactstrap';
import { deleteStatementById, createResourceStatement } from 'services/backend/statements';
import { getResource } from 'services/backend/resources';
import { createResource } from 'services/backend/resources';
import { getSimilarContribution } from 'services/similarity/index';
import AddToComparison from './AddToComparison';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import ContentLoader from 'react-content-loader';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import ROUTES from 'constants/routes';
import SimilarContributions from './SimilarContributions';
import StatementBrowser from 'components/StatementBrowser/StatementBrowser';
import ResearchProblemInput from 'components/AddPaper/Contributions/ResearchProblemInput';
import ContributionItemList from 'components/AddPaper/Contributions/ContributionItemList';
import ContributionComparisons from 'components/ViewPaper/ContirbutionComparisons/ContributionComparisons';
import ProvenanceBox from 'components/ViewPaper/ProvenanceBox/ProvenanceBox';
import { connect } from 'react-redux';
import { reverse } from 'named-urls';
import { toast } from 'react-toastify';
import { selectContribution, updateResearchProblems } from 'actions/viewPaper';
import { getReseachProblemsOfContribution } from 'actions/statementBrowser';
import styled from 'styled-components';
import { StyledHorizontalContributionsList, StyledHorizontalContribution, AddContribution } from 'components/AddPaper/Contributions/styled';
import Tippy from '@tippyjs/react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import SuggestedTemplates from 'components/StatementBrowser/SuggestedTemplates/SuggestedTemplates';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { PREDICATES, CLASSES } from 'constants/graphSettings';

const Title = styled.div`
    font-size: 18px;
    font-weight: 500;
    margin-top: 30px;
    margin-bottom: 5px;

    a {
        margin-left: 15px;
        span {
            font-size: 80%;
        }
    }
`;

const AnimationContainer = styled(CSSTransition)`
    transition: 0.3s background-color, 0.3s border-color;

    &.fadeIn-enter {
        opacity: 0;
    }

    &.fadeIn-enter.fadeIn-enter-active {
        opacity: 1;
        transition: 0.5s opacity;
    }
`;

const ResearchProblemButton = styled.span`
    white-space: normal;
    text-align: left;
    user-select: text !important;
`;

// TODO: right now, the reducer from addPaper is being used, since the setup of this page is very similar.
// Dependent on the future look/functionalitiy of this page, the reducers should split and renamed so viewing
// a paper is not needing a reducer that is called: addPaper (e.g. make a reducer for the statement browser?)
class Contributions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedContribution: '',
            loading: true,
            similaireContributions: [],
            isSimilaireContributionsLoading: true,
            isSimilaireContributionsFailedLoading: false,
            label: '',
            observatories: [],
            organizationId: '',
            observatoryId: '',
            isLoadingObservatory: false
        };
    }

    componentDidUpdate = prevProps => {
        if (this.props.paperId !== prevProps.paperId) {
            this.setState({ loading: true });
        }
        if (this.props.selectedContribution !== '' && this.props.selectedContribution !== this.state.selectedContribution) {
            this.setState({ selectedContribution: this.props.selectedContribution }, () => {
                this.handleSelectContribution(this.state.selectedContribution);
            });
        }
    };

    handleSelectContribution = contributionId => {
        this.setState({ loading: true, isSimilaireContributionsLoading: true });
        const contributionIsLoaded = !!this.props.resources.byId[contributionId];
        // get the contribution label
        const contributionResource = this.props.contributions.find(c => c.id === this.props.selectedContribution);
        if (contributionResource) {
            this.props.selectContribution({
                contributionId,
                contributionIsLoaded,
                contributionLabel: contributionResource.label
            });
        }
        getSimilarContribution(this.state.selectedContribution)
            .then(similaireContributions => {
                const similaireContributionsData = similaireContributions.map(paper => {
                    // Fetch the data of each paper
                    return getResource(paper.paperId).then(paperResource => {
                        paper.title = paperResource.label;
                        return paper;
                    });
                });
                Promise.all(similaireContributionsData).then(results => {
                    this.setState({
                        similaireContributions: results,
                        isSimilaireContributionsLoading: false,
                        isSimilaireContributionsFailedLoading: false
                    });
                });
            })
            .catch(error => {
                this.setState({ similaireContributions: [], isSimilaireContributionsLoading: false, isSimilaireContributionsFailedLoading: true });
            });
        this.setState({ loading: false });
    };

    handleResearchProblemsChange = async (problemsArray, a) => {
        problemsArray = problemsArray ? problemsArray : [];
        if (a.action === 'select-option') {
            const statement = await createResourceStatement(this.state.selectedContribution, PREDICATES.HAS_RESEARCH_PROBLEM, a.option.id);
            //find the index of research problem
            const objIndex = problemsArray.findIndex(obj => obj.id === a.option.id);
            // set the statement of the research problem
            const updatedObj = { ...problemsArray[objIndex], statementId: statement.id };
            // update the rsearch problem array
            problemsArray = [...problemsArray.slice(0, objIndex), updatedObj, ...problemsArray.slice(objIndex + 1)];
            toast.success('Research problem added successfully');
        } else if (a.action === 'create-option') {
            const newResource = await createResource(a.createdOptionLabel, [CLASSES.PROBLEM]);
            const statement = await createResourceStatement(this.state.selectedContribution, PREDICATES.HAS_RESEARCH_PROBLEM, newResource.id);
            //find the index of research problem
            const objIndex = problemsArray.findIndex(obj => obj.id === a.createdOptionId);
            // set the statement of the research problem
            const updatedObj = { ...problemsArray[objIndex], statementId: statement.id, id: newResource.id };
            // update the research problem array
            problemsArray = [...problemsArray.slice(0, objIndex), updatedObj, ...problemsArray.slice(objIndex + 1)];
            toast.success('Research problem added successfully');
        } else if (a.action === 'remove-value') {
            await deleteStatementById(a.removedValue.statementId);
            toast.success('Research problem deleted successfully');
        }
        this.props.updateResearchProblems({
            problemsArray,
            contributionId: this.state.selectedContribution
        });
    };

    render() {
        const selectedContributionId = this.state.selectedContribution;

        let shared = 1;
        if (Object.keys(this.props.resources.byId).length !== 0 && (this.props.selectedResource || selectedContributionId)) {
            const resourceObj = this.props.resources.byId[this.props.selectedResource ? this.props.selectedResource : selectedContributionId];
            if (resourceObj) {
                shared = resourceObj.shared;
            } else {
                shared = 0;
            }
        }

        return (
            <div>
                <Container>
                    <Row>
                        <Col md="9">
                            {this.state.loading && (
                                <div>
                                    <ContentLoader
                                        height="100%"
                                        width="100%"
                                        viewBox="0 0 100 6"
                                        style={{ width: '100% !important' }}
                                        speed={2}
                                        backgroundColor="#f3f3f3"
                                        foregroundColor="#ecebeb"
                                    >
                                        <rect x="0" y="0" rx="1" ry="1" width={20} height="5" />
                                        <rect x="21" y="0" rx="1" ry="1" width={20} height="5" />
                                        <rect x="42" y="0" rx="1" ry="1" width={20} height="5" />
                                    </ContentLoader>
                                </div>
                            )}
                            {!this.state.loading && (
                                <StyledHorizontalContributionsList className={!this.props.enableEdit && 'noEdit'}>
                                    {this.props.contributions.map(contribution => {
                                        return (
                                            <ContributionItemList
                                                paperId={this.props.paperId}
                                                handleChangeContributionLabel={this.props.handleChangeContributionLabel}
                                                isSelected={contribution.id === selectedContributionId}
                                                canDelete={this.props.contributions.length !== 1}
                                                selectedContributionId={this.state.selectedContribution}
                                                contribution={contribution}
                                                key={contribution.id}
                                                toggleDeleteContribution={this.props.toggleDeleteContribution}
                                                enableEdit={this.props.enableEdit}
                                            />
                                        );
                                    })}
                                    {this.props.enableEdit && (
                                        <li>
                                            <AddContribution color="link" onClick={() => this.props.handleCreateContribution()}>
                                                <Tippy content="Add contribution">
                                                    <span>
                                                        <Icon size="xs" icon={faPlus} />
                                                    </span>
                                                </Tippy>
                                            </AddContribution>
                                        </li>
                                    )}
                                </StyledHorizontalContributionsList>
                            )}
                        </Col>

                        <TransitionGroup className="col-md-9" exit={false}>
                            <AnimationContainer key={selectedContributionId} classNames="fadeIn" timeout={{ enter: 500, exit: 0 }}>
                                <StyledHorizontalContribution>
                                    {!this.state.loading && this.props.enableEdit && (
                                        <SuggestedTemplates
                                            syncBackend={true}
                                            selectedResource={this.props.selectedResource ? this.props.selectedResource : selectedContributionId}
                                            researchField={this.props.researchField.id}
                                            researchProblems={this.props.researchProblemsIds}
                                            disabled={shared > 1 ? true : false}
                                        />
                                    )}
                                    {!this.state.loading && (
                                        <AddToComparison
                                            contributionId={selectedContributionId}
                                            paperId={this.props.paperId}
                                            paperTitle={this.props.paperTitle}
                                            contributionTitle={
                                                this.props.contributions.find(c => c.id === selectedContributionId)
                                                    ? this.props.contributions.find(c => c.id === selectedContributionId).label
                                                    : 'Contribution'
                                            }
                                        />
                                    )}
                                    <Form>
                                        <FormGroup>
                                            <Title style={{ marginTop: 0 }}>Research problems</Title>
                                            {this.state.loading && (
                                                <div>
                                                    <ContentLoader
                                                        height="100%"
                                                        width="100%"
                                                        viewBox="0 0 100 5"
                                                        style={{ width: '100% !important' }}
                                                        speed={2}
                                                        backgroundColor="#f3f3f3"
                                                        foregroundColor="#ecebeb"
                                                    >
                                                        <rect x="0" y="0" width="40" height="2" />
                                                        <rect x="0" y="3" width="40" height="2" />
                                                    </ContentLoader>
                                                </div>
                                            )}
                                            {!this.state.loading && !this.props.enableEdit && (
                                                <>
                                                    {this.props.researchProblems &&
                                                        this.props.researchProblems.length > 0 &&
                                                        this.props.researchProblems.map((problem, index) => (
                                                            <span key={index}>
                                                                <Link to={reverse(ROUTES.RESEARCH_PROBLEM, { researchProblemId: problem.id })}>
                                                                    <ResearchProblemButton className="btn btn-link p-0 border-0 align-baseline">
                                                                        {problem.label}
                                                                    </ResearchProblemButton>
                                                                </Link>
                                                                <br />
                                                            </span>
                                                        ))}
                                                    {this.props.researchProblems && this.props.researchProblems.length === 0 && (
                                                        <i>
                                                            No research problems added yet. Please contribute by{' '}
                                                            <Button
                                                                color="link"
                                                                style={{ verticalAlign: 'initial', fontStyle: 'italic' }}
                                                                className="m-0 p-0"
                                                                onClick={() => this.props.toggleEditMode()}
                                                            >
                                                                editing
                                                            </Button>{' '}
                                                            the paper.
                                                        </i>
                                                    )}
                                                </>
                                            )}
                                            {!this.state.loading && this.props.enableEdit && (
                                                <>
                                                    <ResearchProblemInput
                                                        handler={this.handleResearchProblemsChange}
                                                        value={this.props.researchProblems}
                                                    />
                                                </>
                                            )}
                                        </FormGroup>

                                        <FormGroup>
                                            <Title>Contribution data</Title>
                                            {this.state.loading && (
                                                <div>
                                                    <ContentLoader
                                                        height="100%"
                                                        width="100%"
                                                        viewBox="0 0 100 6"
                                                        style={{ width: '100% !important' }}
                                                        speed={2}
                                                        backgroundColor="#f3f3f3"
                                                        foregroundColor="#ecebeb"
                                                    >
                                                        <rect x="0" y="0" rx="1" ry="1" width="90" height="6" />
                                                    </ContentLoader>
                                                </div>
                                            )}
                                            {!this.state.loading && (
                                                <StatementBrowser
                                                    enableEdit={this.props.enableEdit}
                                                    syncBackend={this.props.enableEdit}
                                                    openExistingResourcesInDialog={false}
                                                    templatesFound={false}
                                                    initOnLocationChange={false}
                                                    keyToKeepStateOnLocationChange={this.props.paperId}
                                                />
                                            )}
                                        </FormGroup>

                                        <div>
                                            <Title>Similar contributions</Title>
                                            {this.state.isSimilaireContributionsLoading && (
                                                <div>
                                                    <ContentLoader
                                                        height="100%"
                                                        width="100%"
                                                        viewBox="0 0 100 10"
                                                        style={{ width: '100% !important' }}
                                                        speed={2}
                                                        backgroundColor="#f3f3f3"
                                                        foregroundColor="#ecebeb"
                                                    >
                                                        <rect x="0" y="0" rx="2" ry="2" width="32" height="10" />
                                                        <rect x="33" y="0" rx="2" ry="2" width="32" height="10" />
                                                        <rect x="66" y="0" rx="2" ry="2" width="32" height="10" />
                                                    </ContentLoader>
                                                </div>
                                            )}
                                            {!this.state.isSimilaireContributionsLoading && (
                                                <>
                                                    {!this.state.isSimilaireContributionsFailedLoading ? (
                                                        <SimilarContributions
                                                            similaireContributions={this.state.similaireContributions.slice(0, 3)}
                                                        />
                                                    ) : (
                                                        <Alert color="light">
                                                            Failed to connect to the similarity service, please try again later
                                                        </Alert>
                                                    )}
                                                </>
                                            )}
                                            {this.state.similaireContributions.length > 0 && (
                                                <Link
                                                    className="clearfix"
                                                    to={`${reverse(
                                                        ROUTES.COMPARISON
                                                    )}?contributions=${selectedContributionId},${this.state.similaireContributions
                                                        .slice(0, 3)
                                                        .map(s => s.contributionId)
                                                        .join(',')}`}
                                                >
                                                    {/* TODO: use constants for URL */}
                                                    <span
                                                        style={{ margin: '7px 5px 0 0', fontSize: '95%' }}
                                                        className="float-right btn btn-link p-0 border-0 align-baseline"
                                                    >
                                                        Compare these contributions
                                                    </span>
                                                </Link>
                                            )}
                                        </div>

                                        {selectedContributionId && <ContributionComparisons contributionId={selectedContributionId} />}
                                    </Form>
                                </StyledHorizontalContribution>
                            </AnimationContainer>
                        </TransitionGroup>
                        <ProvenanceBox
                            resourceId={this.props.paperId}
                            contributors={this.props.contributors}
                            observatoryInfo={this.props.observatoryInfo}
                            changeObservatory={this.props.changeObservatory}
                        />
                    </Row>
                </Container>
            </div>
        );
    }
}

Contributions.propTypes = {
    researchProblems: PropTypes.array.isRequired,
    researchProblemsIds: PropTypes.array.isRequired,
    resources: PropTypes.object.isRequired,
    selectedContribution: PropTypes.string.isRequired,
    selectContribution: PropTypes.func.isRequired,
    toggleEditMode: PropTypes.func.isRequired,
    contributions: PropTypes.array.isRequired,
    paperId: PropTypes.string.isRequired,
    paperTitle: PropTypes.string.isRequired,
    enableEdit: PropTypes.bool.isRequired,
    updateResearchProblems: PropTypes.func.isRequired,
    handleChangeContributionLabel: PropTypes.func.isRequired,
    handleCreateContribution: PropTypes.func.isRequired,
    toggleDeleteContribution: PropTypes.func.isRequired,
    observatoryInfo: PropTypes.object,
    contributors: PropTypes.array,
    researchField: PropTypes.object.isRequired,
    selectedResource: PropTypes.string,
    changeObservatory: PropTypes.func
};

const mapStateToProps = (state, ownProps) => {
    const researchProblems =
        state.viewPaper.researchProblems[ownProps.selectedContribution] && state.viewPaper.researchProblems[ownProps.selectedContribution].length > 0
            ? state.viewPaper.researchProblems[ownProps.selectedContribution]
            : [];

    // All the research problem ids (concatination of the research problem input field and the statement browser)
    const researchProblemsIds = [
        ...getReseachProblemsOfContribution(
            state,
            state.addPaper.contributions.byId[ownProps.selectedContribution]
                ? state.addPaper.contributions.byId[ownProps.selectedContribution].resourceId
                : []
        ),
        ...(researchProblems.length > 0 ? researchProblems.map(c => c.id) : [])
    ];
    return {
        researchProblemsIds: researchProblemsIds,
        researchProblems: researchProblems,
        selectedResource: state.statementBrowser.selectedResource,
        resources: state.statementBrowser.resources,
        researchField: state.viewPaper.researchField
    };
};

const mapDispatchToProps = dispatch => ({
    selectContribution: data => dispatch(selectContribution(data)),
    updateResearchProblems: data => dispatch(updateResearchProblems(data))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Contributions);
