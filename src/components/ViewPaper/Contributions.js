import React, { Component } from 'react';
import { Alert, Col, Container, Form, FormGroup, Row, Button } from 'reactstrap';
import {
    getResource,
    getSimilaireContribution,
    deleteStatementById,
    createResource,
    createResourceStatement,
    getObservatorybyId,
    getOrganization,
    getUserInformationById,
    getContributorsByResourceId
} from '../../network';
import AddToComparison from './AddToComparison';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import ContentLoader from 'react-content-loader';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import ROUTES from '../../constants/routes';
import SimilarContributions from './SimilarContributions';
import StatementBrowser from 'components/StatementBrowser/Statements/StatementsContainer';
import ResearchProblemInput from 'components/AddPaper/Contributions/ResearchProblemInput';
import ContributionItemList from 'components/AddPaper/Contributions/ContributionItemList';
import { connect } from 'react-redux';
import { reverse } from 'named-urls';
import { toast } from 'react-toastify';
import { selectContribution, updateResearchProblems } from '../../actions/viewPaper';
import styled from 'styled-components';
import { StyledHorizontalContributionsList, StyledHorizontalContribution } from '../AddPaper/Contributions/styled';
import Tippy from '@tippy.js/react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';

const FeaturedTabs = styled.div`
    .tab {
        margin-bottom: 0;
        padding: 10px;
        color: #666666;
        cursor: pointer;
        -webkit-transition: border 500ms ease-out;
        -moz-transition: border 500ms ease-out;
        -o-transition: border 500ms ease-out;
        transition: border 500ms ease-out;
        background-color: #d4d8e0;
        font-size: 12px;
        font-weight: bold;
        &.active,
        &:hover {
            background-color: #f8f9fb;
            color: #666666;
        }
    }
`;

const ErrorMessage = styled.div`
    margin-bottom: 0;
    padding: 10px;
    color: #666666;
    cursor: pointer;
    height: 60px;
    -webkit-transition: border 500ms ease-out;
    -moz-transition: border 500ms ease-out;
    -o-transition: border 500ms ease-out;
    transition: border 500ms ease-out;
    background-color: #e0f2fc;
    border-color: #e0f2fc;
    font-size: 12px;
    font-weight: bold;
`;

const SidebarStyledBox = styled.div`
    flex-grow: 1;
    overflow: hidden;
    @media (max-width: 768px) {
        margin-top: 20px;
    }
`;

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

const buttonStyle = {
    backgroundColor: '#f8f9fb',
    paddingLeft: 15,
    paddingTop: 10,
    borderBottom: '1px solid #eeeff3',
    fontSize: 12
    //border: solid,
};

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
            observatory: [],
            label: '',
            activeTab: 1,
            userData: []
        };
    }

    componentDidUpdate = prevProps => {
        if (this.props.paperId !== prevProps.paperId) {
            this.setState({ loading: true });
        }
        if (this.props.selectedContribution !== '' && this.props.selectedContribution !== this.state.selectedContribution) {
            this.setState({ selectedContribution: this.props.selectedContribution }, () => {
                this.handleSelectContribution(this.state.selectedContribution);

                this.getObservatoryAndOrganizationInformation(this.props.observatoryInfo[0]);
                this.getResourceContributors(this.props.paperId);
            });
        }
    };

    toggle = tab => {
        if (this.state.activeTab !== tab) {
            this.setState({ activeTab: tab });
        }
    };

    handleSelectContribution = contributionId => {
        this.setState({ loading: true, isSimilaireContributionsLoading: true });
        const contributionIsLoaded = this.props.resources.byId[contributionId] ? true : false;
        this.props.selectContribution({
            contributionId,
            contributionIsLoaded
        });
        getSimilaireContribution(this.state.selectedContribution)
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
            const statement = await createResourceStatement(
                this.state.selectedContribution,
                process.env.REACT_APP_PREDICATES_HAS_RESEARCH_PROBLEM,
                a.option.id
            );
            //find the index of research problem
            const objIndex = problemsArray.findIndex(obj => obj.id === a.option.id);
            // set the statement of the research problem
            const updatedObj = { ...problemsArray[objIndex], statementId: statement.id };
            // update the rsearch problem array
            problemsArray = [...problemsArray.slice(0, objIndex), updatedObj, ...problemsArray.slice(objIndex + 1)];
            toast.success('Research problem added successfully');
        } else if (a.action === 'create-option') {
            const newResource = await createResource(a.createdOptionLabel, [process.env.REACT_APP_CLASSES_PROBLEM]);
            const statement = await createResourceStatement(
                this.state.selectedContribution,
                process.env.REACT_APP_PREDICATES_HAS_RESEARCH_PROBLEM,
                newResource.id
            );
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

    getObservatoryAndOrganizationInformation = async id => {
        //const temp = [];
        getObservatorybyId(id)
            .then(responseJson => {
                //const orgInfo =
                //console.log(responseJson);
                getOrganization(responseJson.organizationId)
                    .then(orgResponse => {
                        //console.log(orgResponse);

                        getUserInformationById(this.props.observatoryInfo[2])
                            .then(userResponse => {
                                //console.log(responseJson);

                                this.setState({
                                    observatory: {
                                        name: responseJson.name.toUpperCase(),
                                        organizationName: orgResponse.organizationName,
                                        organizationLogo: orgResponse.organizationLogo,
                                        userName: userResponse.display_name
                                    }
                                });
                            })
                            .catch(error => {
                                this.setState({ label: null, isLoading: false });
                            });
                    })
                    .catch(error => {
                        this.setState({ label: null, isLoading: false });
                    });
            })
            .catch(error => {
                this.setState({ label: null, isLoading: false });
            });
    };

    getResourceContributors = async id => {
        //const temp = [];
        getContributorsByResourceId(id)
            .then(responseJson => {
                //const orgInfo =
                const a = {};
                for (let i = 0; i < responseJson.length; i++) {
                    //console.log(responseJson.length);
                    a[i] = {};
                    if (/^[0]{8}-[0]{4}-[0]{4}-[0]{4}-[0]{12}$/.test(responseJson[i].created_by)) {
                        a[i]['created_by'] = 'Unknown';
                    } else {
                        getUserInformationById(responseJson[i].created_by).then(userResponse => {
                            if (userResponse !== '') {
                                a[i]['created_by'] = userResponse.display_name;
                            }
                        });
                    }
                    a[i]['created_at'] = responseJson[i].created_at.substring(0, 10);
                    this.setState({
                        userData: [...this.state.userData, a[i]]
                    });
                }
                //console.log(this.state.userData);
                //console.log('--------');
            })
            .catch(error => {
                this.setState({ label: null, isLoading: false });
            });
    };

    render() {
        const selectedContributionId = this.state.selectedContribution;

        let rightSidebar;

        switch (this.state.activeTab) {
            case 1:
            default:
                rightSidebar = (
                    <AnimationContainer key={1} classNames="fadeIn" timeout={{ enter: 700, exit: 0 }}>
                        <div>
                            <ul class="list-group">
                                <li style={buttonStyle}>
                                    <p>
                                        <b>{this.state.observatory.name}</b>
                                        <br />
                                        <center>
                                            <img style={{ paddingTop: 8 }} height="70" src={this.state.observatory.organizationLogo} alt="" />
                                        </center>
                                        <p style={{ fontSize: 12 }}>{this.state.observatory.organizationName}</p>
                                    </p>
                                </li>

                                <li style={buttonStyle}>
                                    <p>
                                        <b>DATE ADDED</b>
                                        <br />
                                        {this.props.observatoryInfo[1]}
                                    </p>
                                </li>

                                <li style={buttonStyle}>
                                    <p>
                                        <b>ADDED BY</b>
                                        <br />
                                        {this.state.observatory.userName}
                                    </p>
                                </li>
                                <li style={buttonStyle}>
                                    <b>CONTRIBUTORS</b>
                                    {this.state.userData.map((key, user) => {
                                        return <div>{key['created_by'] !== 'Unknown' && <span>{key['created_by']}</span>}</div>;
                                    })}
                                </li>
                            </ul>
                        </div>
                    </AnimationContainer>
                );
                break;
            case 2:
                rightSidebar = (
                    <AnimationContainer key={2} classNames="fadeIn" timeout={{ enter: 700, exit: 0 }}>
                        <div>
                            {this.state.userData.map((key, user) => {
                                return (
                                    <VerticalTimeline>
                                        <VerticalTimelineElement
                                            className="vertical-timeline-element--work"
                                            date={key['created_at']}
                                            iconStyle={{ background: 'rgb(212, 216, 224)', color: '#b8b8b9' }}
                                        >
                                            {key['created_by'] === this.state.observatory.userName && (
                                                <p>
                                                    Added by <b>{key['created_by']}</b>{' '}
                                                </p>
                                            )}

                                            {key['created_by'] !== this.state.observatory.userName && (
                                                <p>
                                                    Updated by <b>{key['created_by']}</b>{' '}
                                                </p>
                                            )}
                                        </VerticalTimelineElement>
                                    </VerticalTimeline>
                                );
                            })}
                        </div>
                    </AnimationContainer>
                );
                break;
        }

        return (
            <div>
                <Container>
                    <Row noGutters={true}>
                        <Col md="9">
                            {this.state.loading && (
                                <div>
                                    <ContentLoader height={6} width={100} speed={2} primaryColor="#f3f3f3" secondaryColor="#ecebeb">
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
                                        <li className={'addContribution'} onClick={() => this.props.handleCreateContribution()}>
                                            <Tippy content="Add contribution">
                                                <span>
                                                    <Icon size="xs" icon={faPlus} />
                                                </span>
                                            </Tippy>
                                        </li>
                                    )}
                                </StyledHorizontalContributionsList>
                            )}
                        </Col>

                        <TransitionGroup className="col-md-9" exit={false}>
                            <AnimationContainer key={selectedContributionId} classNames="fadeIn" timeout={{ enter: 500, exit: 0 }}>
                                <StyledHorizontalContribution>
                                    {!this.state.loading && (
                                        <AddToComparison
                                            contributionId={selectedContributionId}
                                            paperId={this.props.paperId}
                                            paperTitle={this.props.paperTitle}
                                            contributionTitle={
                                                this.props.contributions.find(function(c) {
                                                    return c.id === selectedContributionId;
                                                }).label
                                            }
                                        />
                                    )}
                                    <Form>
                                        <FormGroup>
                                            <Title style={{ marginTop: 0 }}>Research problems</Title>
                                            {this.state.loading && (
                                                <div>
                                                    <ContentLoader height={7} width={100} speed={2} primaryColor="#f3f3f3" secondaryColor="#ecebeb">
                                                        <rect x="0" y="0" width="40" height="3" />
                                                        <rect x="0" y="4" width="40" height="3" />
                                                    </ContentLoader>
                                                </div>
                                            )}
                                            {!this.state.loading && !this.props.enableEdit && (
                                                <>
                                                    {this.props.researchProblems[selectedContributionId] &&
                                                        this.props.researchProblems[selectedContributionId].length > 0 &&
                                                        this.props.researchProblems[selectedContributionId].map((problem, index) => (
                                                            <span key={index}>
                                                                <Link to={reverse(ROUTES.RESEARCH_PROBLEM, { researchProblemId: problem.id })}>
                                                                    <span
                                                                        style={{ whiteSpace: 'normal', textAlign: 'left' }}
                                                                        className="btn btn-link p-0 border-0 align-baseline"
                                                                    >
                                                                        {problem.label}
                                                                    </span>
                                                                </Link>
                                                                <br />
                                                            </span>
                                                        ))}
                                                    {this.props.researchProblems[selectedContributionId] &&
                                                        this.props.researchProblems[selectedContributionId].length === 0 && (
                                                            <i>
                                                                No research problems added yet. Please contribute by{' '}
                                                                <Button
                                                                    color="link"
                                                                    style={{ verticalAlign: 'initial', fontStyle: 'italic' }}
                                                                    className={'m-0 p-0'}
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
                                                        value={this.props.researchProblems[selectedContributionId]}
                                                    />
                                                </>
                                            )}
                                        </FormGroup>

                                        <FormGroup>
                                            <Title>Contribution data</Title>
                                            {this.state.loading && (
                                                <div>
                                                    <ContentLoader height={6} width={100} speed={2} primaryColor="#f3f3f3" secondaryColor="#ecebeb">
                                                        <rect x="0" y="0" rx="2" ry="2" width="90" height="6" />
                                                    </ContentLoader>
                                                </div>
                                            )}
                                            {!this.state.loading && (
                                                <StatementBrowser
                                                    enableEdit={this.props.enableEdit}
                                                    syncBackend={this.props.enableEdit}
                                                    openExistingResourcesInDialog={false}
                                                />
                                            )}
                                        </FormGroup>

                                        <FormGroup>
                                            <Title>Similar contributions</Title>
                                            {this.state.isSimilaireContributionsLoading && (
                                                <div>
                                                    <ContentLoader height={10} width={100} speed={2} primaryColor="#f3f3f3" secondaryColor="#ecebeb">
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
                                        </FormGroup>
                                    </Form>
                                </StyledHorizontalContribution>
                            </AnimationContainer>
                        </TransitionGroup>
                        {!/^[0]{8}-[0]{4}-[0]{4}-[0]{4}-[0]{12}$/.test(this.props.observatoryInfo[0]) && (
                            <div>
                                <SidebarStyledBox
                                    style={{ width: 230, minHeight: 430, backgroundColor: '#f8f9fb', marginLeft: 20 }}
                                    className="box rounded-lg"
                                >
                                    <FeaturedTabs className="clearfix d-flex">
                                        <div
                                            id="div1"
                                            className={`h6 col-md-6 text-center tab ${this.state.activeTab === 1 ? 'active' : ''}`}
                                            onClick={() => this.toggle(1)}
                                        >
                                            Provenance
                                        </div>
                                        <div
                                            id="div2"
                                            className={`h6 col-md-6 text-center tab ${this.state.activeTab === 2 ? 'active' : ''}`}
                                            onClick={() => this.toggle(2)}
                                        >
                                            Timeline
                                        </div>
                                    </FeaturedTabs>
                                    {this.props.observatoryInfo[3] && (
                                        <ErrorMessage class="alert-server">The data has been partially imported automatically.</ErrorMessage>
                                    )}
                                    <TransitionGroup exit={false}>{rightSidebar}</TransitionGroup>
                                </SidebarStyledBox>
                            </div>
                        )}
                    </Row>
                </Container>
            </div>
        );
    }
}

Contributions.propTypes = {
    researchProblems: PropTypes.object.isRequired,
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
    toggleDeleteContribution: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    researchProblems: state.viewPaper.researchProblems,
    resources: state.statementBrowser.resources
});

const mapDispatchToProps = dispatch => ({
    selectContribution: data => dispatch(selectContribution(data)),
    updateResearchProblems: data => dispatch(updateResearchProblems(data))
});

Contributions.propTypes = {
    observatoryInfo: PropTypes.object
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Contributions);
