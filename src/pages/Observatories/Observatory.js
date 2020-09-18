import React, { Component } from 'react';
import { Container, Modal, ModalBody, ModalHeader, Button } from 'reactstrap';
import { Col, Row } from 'reactstrap';
import {
    getUsersByObservatoryId,
    getOrganization,
    getResourcesByObservatoryId,
    getComparisonsByObservatoryId,
    getProblemsByObservatoryId,
    getObservatoryById,
    getStatementsBySubjects
} from 'network';
import InternalServerError from 'pages/InternalServerError';
import ContributorCard from 'components/ContributorCard/ContributorCard';
import PaperCard from 'components/PaperCard/PaperCard';
import ComparisonCard from 'components/ComparisonCard/ComparisonCard';
import NotFound from 'pages/NotFound';
import PropTypes from 'prop-types';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { Link } from 'react-router-dom';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { getPaperData, getComparisonData } from 'utils';
import { find } from 'lodash';
import { connect } from 'react-redux';
import EditObservatory from '../Observatories/EditObservatory';

class Observatory extends Component {
    constructor(props) {
        super(props);

        this.state = {
            error: null,
            label: '',
            description: '',
            researchField: '',
            isContributorsModalOpen: false,
            isLoading: false,
            isLoadingContributors: false,
            isLoadingPapers: false,
            isLoadingOrganizations: false,
            isLoadingProblems: false,
            isLoadingComparisons: false,
            contributors: [],
            problemsList: [],
            activeTab: 1,
            papersList: [],
            organizationsList: [],
            comparisonsList: [],
            showEditDialog: false
        };
    }

    componentDidMount() {
        this.loadObservatory();
        this.loadContributors();
        this.loadPapers();
        this.loadComparisons();
        this.loadProblems();
    }

    componentDidUpdate = prevProps => {
        if (this.props.match.params.id !== prevProps.match.params.id) {
            this.loadObservatory();
            this.loadContributors();
            this.loadPapers();
            this.loadComparisons();
            this.loadProblems();
        }
    };

    loadObservatory = () => {
        this.setState({ isLoading: true });
        getObservatoryById(this.props.match.params.id)
            .then(observatory => {
                document.title = `${observatory.name} - Details`;
                this.setState({
                    label: observatory.name,
                    description: observatory.description,
                    isLoading: false,
                    researchField: observatory.researchField
                });
                this.loadOrganizations(observatory.organizations);
            })
            .catch(error => {
                this.setState({ error: error, isLoading: false });
            });
    };

    loadPapers = () => {
        this.setState({ isLoadingPapers: true });
        getResourcesByObservatoryId(this.props.match.params.id)
            .then(papers => {
                // Fetch the data of each comparison
                return getStatementsBySubjects({
                    ids: papers.map(c => c.id)
                }).then(resourcesStatements => {
                    const papersData = resourcesStatements.map(resourceStatements => {
                        const paperSubject = find(papers, { id: resourceStatements.id });
                        return getPaperData(
                            resourceStatements.id,
                            resourceStatements && paperSubject.label ? paperSubject.label : 'No Title',
                            resourceStatements.statements
                        );
                    });
                    this.setState({
                        papersList: papersData,
                        isLoadingPapers: false
                    });
                });
            })
            .catch(error => {
                this.setState({ error: error, isLoadingPapers: false });
            });
    };

    loadComparisons = () => {
        this.setState({ isLoadingComparisons: true });
        getComparisonsByObservatoryId(this.props.match.params.id)
            .then(comparisons => {
                // Fetch the data of each comparison
                return getStatementsBySubjects({
                    ids: comparisons.map(c => c.id)
                }).then(resourcesStatements => {
                    const comparisonsData = resourcesStatements.map(resourceStatements => {
                        const comparisonSubject = find(comparisons, { id: resourceStatements.id });
                        return getComparisonData(
                            resourceStatements.id,
                            resourceStatements && comparisonSubject.label ? comparisonSubject.label : 'No Title',
                            resourceStatements.statements
                        );
                    });
                    this.setState({
                        comparisonsList: comparisonsData,
                        isLoadingComparisons: false
                    });
                });
            })
            .catch(error => {
                this.setState({ error: error, isLoadingComparisons: false });
            });
    };

    loadProblems = () => {
        this.setState({ isLoadingProblems: true });
        getProblemsByObservatoryId(this.props.match.params.id)
            .then(problems => {
                this.setState({
                    problemsList: problems,
                    isLoadingProblems: false
                });
            })
            .catch(error => {
                this.setState({ error: error, isLoadingProblems: false });
            });
    };

    loadContributors = () => {
        this.setState({ isLoadingContributors: true });
        getUsersByObservatoryId(this.props.match.params.id)
            .then(contributors => {
                this.setState({
                    contributors: contributors,
                    isLoadingContributors: false
                });
            })
            .catch(error => {
                this.setState({ error: error, isLoadingContributors: false });
            });
    };

    loadOrganizations = organizationsData => {
        this.setState({ isLoadingOrganizations: true });
        Promise.all(organizationsData.map(o => getOrganization(o.id))).then(data => {
            this.setState({
                organizationsList: data,
                isLoadingOrganizations: false
            });
        });
    };

    updateObservatoryMetadata = (label, description, researchField) => {
        this.setState({ label: label, description: description, researchField: researchField });
    };

    toggle = type => {
        this.setState(prevState => ({
            [type]: !prevState[type]
        }));
    };

    render = () => {
        return (
            <>
                {this.state.isLoading && <Container className="box pt-4 pb-4 pl-5 pr-5 mt-5 clearfix">Loading ...</Container>}
                {!this.state.isLoading && this.state.error && <>{this.state.error.statusCode === 404 ? <NotFound /> : <InternalServerError />}</>}
                {!this.state.isLoading && !this.state.error && this.state.label && (
                    <>
                        <Container className="d-flex align-items-center">
                            <h3 className="h4 my-4 flex-grow-1">Observatory</h3>
                        </Container>

                        <Container className="box rounded-lg clearfix pt-4 pb-4 pl-5 pr-5">
                            <h3>{this.state.label}</h3>
                            {this.props.user && (
                                <Button
                                    color="darkblue"
                                    size="sm"
                                    style={{ float: 'right', marginTop: '-40px' }}
                                    onClick={() => this.toggle('showEditDialog')}
                                >
                                    <Icon icon={faPen} /> Edit
                                </Button>
                            )}
                            {this.state.description}
                        </Container>

                        <Container>
                            <Row className="mt-4">
                                <Col md={4} sm={12} style={{ minHeight: '300px' }} className="d-flex px-0 pr-3">
                                    <div className="box rounded-lg p-4 flex-grow-1">
                                        <h5>Research Problems</h5>
                                        {!this.state.isLoadingProblems ? (
                                            <div className="mb-4 mt-2">
                                                {this.state.problemsList.length > 0 ? (
                                                    <div>
                                                        <ol className="list-group" style={{ paddingLeft: 15 }}>
                                                            {this.state.problemsList.map((problem, index) => {
                                                                return (
                                                                    <li key={`rp${index}`} className="mt-2">
                                                                        <Link
                                                                            to={reverse(ROUTES.RESEARCH_PROBLEM, { researchProblemId: problem.id })}
                                                                        >
                                                                            {problem.label}
                                                                        </Link>
                                                                    </li>
                                                                );
                                                            })}
                                                        </ol>
                                                    </div>
                                                ) : (
                                                    <div className="text-center mt-4 mb-4">No Research Problems</div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center mt-4 mb-4">Loading research problems ...</div>
                                        )}
                                    </div>
                                </Col>
                                <Col md={4} sm={12} style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div className="box rounded-lg p-4 flex-grow-1">
                                        <h5>Organizations</h5>
                                        {!this.state.isLoadingOrganizations ? (
                                            <div className="mb-4 mt-4">
                                                {this.state.organizationsList.length > 0 ? (
                                                    <div>
                                                        {this.state.organizationsList.map((organization, index) => {
                                                            if (organization.logo) {
                                                                return (
                                                                    <div
                                                                        key={`c${index}`}
                                                                        className="mb-3"
                                                                        style={{
                                                                            border: 'solid lightgray thin',
                                                                            textAlign: 'center',
                                                                            verticalAlign: 'middle',
                                                                            paddingBottom: '11px'
                                                                        }}
                                                                    >
                                                                        <Link to={reverse(ROUTES.ORGANIZATION, { id: organization.id })}>
                                                                            <img
                                                                                style={{ marginTop: 12 }}
                                                                                height="50"
                                                                                src={organization.logo}
                                                                                alt={`${organization.name} logo`}
                                                                            />
                                                                        </Link>
                                                                    </div>
                                                                );
                                                            } else {
                                                                return (
                                                                    <div
                                                                        key={`c${index}`}
                                                                        className="mb-3 p-2"
                                                                        style={{
                                                                            border: 'solid lightgray thin',
                                                                            textAlign: 'center'
                                                                        }}
                                                                    >
                                                                        <Link to={reverse(ROUTES.ORGANIZATION, { id: organization.id })}>
                                                                            {organization.name}
                                                                        </Link>
                                                                    </div>
                                                                );
                                                            }
                                                        })}
                                                    </div>
                                                ) : (
                                                    <div className="text-center mt-4 mb-4">No Organizations</div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center mt-4 mb-4">Loading organizations ...</div>
                                        )}
                                    </div>
                                </Col>
                                <Col md={4} sm={12} style={{ display: 'flex', flexDirection: 'column' }} className="px-0 pl-3">
                                    <div className="box rounded-lg p-4 flex-grow-1">
                                        <h5>Contributors</h5>

                                        {!this.state.isLoadingContributors ? (
                                            <div className="mb-4 mt-4">
                                                {this.state.contributors.length > 0 ? (
                                                    <div>
                                                        {this.state.contributors.slice(0, 3).map((user, index) => {
                                                            return (
                                                                <div key={`oc${index}`}>
                                                                    <ContributorCard
                                                                        contributor={{
                                                                            ...user,
                                                                            subTitle: this.state.organizationsList.find(o =>
                                                                                o.id.includes(user.organization_id)
                                                                            )?.name
                                                                        }}
                                                                    />

                                                                    <hr style={{ width: '90%', margin: '10px auto' }} />
                                                                </div>
                                                            );
                                                        })}
                                                        {this.state.contributors.length > 3 && (
                                                            <>
                                                                <Button
                                                                    onClick={() => this.toggle('isContributorsModalOpen')}
                                                                    className="mt-1 float-right clearfix p-0"
                                                                    color="link"
                                                                >
                                                                    <small>+ See more</small>
                                                                </Button>
                                                                <Modal
                                                                    isOpen={this.state.isContributorsModalOpen}
                                                                    toggle={() => this.toggle('isContributorsModalOpen')}
                                                                    size="lg"
                                                                >
                                                                    <ModalHeader toggle={() => this.toggle('isContributorsModalOpen')}>
                                                                        Contributors
                                                                    </ModalHeader>
                                                                    <ModalBody>
                                                                        <div className="clearfix">
                                                                            {this.state.contributors.map((user, index) => {
                                                                                return (
                                                                                    <div key={`moc${index}`}>
                                                                                        <ContributorCard
                                                                                            contributor={{
                                                                                                ...user,
                                                                                                subTitle: this.state.organizationsList.find(o =>
                                                                                                    o.id.includes(user.organization_id)
                                                                                                )?.name
                                                                                            }}
                                                                                        />

                                                                                        <hr style={{ width: '90%', margin: '10px auto' }} />
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </ModalBody>
                                                                </Modal>
                                                            </>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="text-center mt-4 mb-4">No Contributors</div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center mt-4 mb-4">Loading Contributors ...</div>
                                        )}
                                    </div>
                                </Col>
                            </Row>
                        </Container>

                        <Container className="d-flex align-items-center">
                            <h1 className="h4 mt-5 mb-4 flex-grow-1">Content</h1>
                        </Container>

                        <Container className="box rounded-lg p-4">
                            <h5>Comparisons</h5>
                            {!this.state.isLoadingComparisons ? (
                                <div className="mb-4 mt-4">
                                    {this.state.comparisonsList.length > 0 ? (
                                        <div>
                                            {this.state.comparisonsList.map(comparison => {
                                                return <ComparisonCard comparison={{ ...comparison }} key={`pc${comparison.id}`} />;
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center mt-4 mb-4">No Comparisons</div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center mt-4 mb-4">Loading comparisons ...</div>
                            )}
                        </Container>

                        <br />
                        <Container className="box rounded-lg p-4">
                            <h5>Papers</h5>
                            {!this.state.isLoadingPapers ? (
                                <div className="mb-4 mt-4">
                                    {this.state.papersList.length > 0 ? (
                                        <div>
                                            {this.state.papersList.map(resource => {
                                                return (
                                                    <PaperCard
                                                        selectable={false}
                                                        paper={{ title: resource.label, ...resource }}
                                                        key={`p${resource.id}`}
                                                    />
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center mt-4 mb-4">No Papers</div>
                                    )}
                                </div>
                            ) : (
                                <div className="mt-4">Loading papers ...</div>
                            )}
                        </Container>
                    </>
                )}
                <EditObservatory
                    showDialog={this.state.showEditDialog}
                    toggle={() => this.toggle('showEditDialog')}
                    label={this.state.label}
                    id={this.props.match.params.id}
                    description={this.state.description}
                    researchField={this.state.researchField}
                    updateObservatoryMetadata={this.updateObservatoryMetadata}
                />
            </>
        );
    };
}

const mapStateToProps = state => ({
    user: state.auth.user
});

Observatory.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            id: PropTypes.string.isRequired
        }).isRequired
    }).isRequired,
    user: PropTypes.object
};

export default connect(mapStateToProps)(Observatory);
