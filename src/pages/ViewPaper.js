import React, { Component } from 'react';
import { Container, Alert, UncontrolledAlert } from 'reactstrap';
import { getStatementsBySubject, createResourceStatement, deleteStatementById } from 'services/backend/statements';
import { getUserInformationById } from 'services/backend/users';
import { getObservatoryAndOrganizationInformation } from 'services/backend/observatories';
import { getResource, updateResource, createResource, getContributorsByResourceId } from 'services/backend/resources';
import { connect } from 'react-redux';
import NotFound from 'pages/NotFound';
import ContentLoader from 'react-content-loader';
import Contributions from 'components/ViewPaper/Contributions';
import PropTypes from 'prop-types';
import ComparisonPopup from 'components/ComparisonPopup/ComparisonPopup';
import PaperHeader from 'components/ViewPaper/PaperHeader';
import { resetStatementBrowser, updateContributionLabel } from 'actions/statementBrowser';
import { loadPaper, selectContribution, setPaperAuthors } from 'actions/viewPaper';
import GizmoGraphViewModal from 'components/ViewPaper/GraphView/GizmoGraphViewModal';
import queryString from 'query-string';
import { toast } from 'react-toastify';
import Confirm from 'reactstrap-confirm';
import VisibilitySensor from 'react-visibility-sensor';
import PaperHeaderBar from 'components/ViewPaper/PaperHeaderBar/PaperHeaderBar';
import PaperMenuBar from 'components/ViewPaper/PaperHeaderBar/PaperMenuBar';
import styled from 'styled-components';
import SharePaper from 'components/ViewPaper/SharePaper';
import { getPaperData_ViewPaper } from 'utils';
import { PREDICATES, CLASSES } from 'constants/graphSettings';

export const EditModeHeader = styled(Container)`
    background-color: #80869b !important;
    color: #fff;
    padding: 8px 25px !important;
    display: flex;
    align-items: center;
`;

export const Title = styled.div`
    font-size: 1.1rem;
    flex-grow: 1;
    & span {
        font-size: small;
        color: ${props => props.theme.ultraLightBlueDarker};
    }
`;

class ViewPaper extends Component {
    state = {
        loading: true,
        loading_failed: false,
        unfoundContribution: false,
        contributions: [],
        selectedContribution: '',
        showGraphModal: false,
        editMode: false,
        observatoryInfo: {},
        contributors: [],
        showHeaderBar: false
    };

    componentDidMount() {
        this.loadPaperData();
    }

    componentDidUpdate = prevProps => {
        if (this.props.match.params.resourceId !== prevProps.match.params.resourceId) {
            this.loadPaperData();
        } else if (this.props.match.params.contributionId !== prevProps.match.params.contributionId) {
            const selectedContribution =
                this.props.match.params.contributionId &&
                this.state.contributions.some(el => {
                    return el.id === this.props.match.params.contributionId;
                })
                    ? this.props.match.params.contributionId
                    : this.state.contributions[0].id;

            this.setState({ selectedContribution: selectedContribution });
        }
    };

    handleShowHeaderBar = isVisible => {
        this.setState({
            showHeaderBar: !isVisible
        });
    };

    loadPaperData = () => {
        this.setState({ loading: true });
        const resourceId = this.props.match.params.resourceId;

        this.props.resetStatementBrowser();
        getResource(resourceId)
            .then(paperResource => {
                this.processObservatoryInformation(paperResource, resourceId);

                getStatementsBySubject({ id: resourceId })
                    .then(paperStatements => {
                        this.processPaperStatements(paperResource, paperStatements);
                    })
                    .then(() => {
                        // read ORCID of authors
                        this.loadAuthorsORCID()
                            .then(() => {
                                // apply selected contribution
                                this.applyContributionSelectionState();
                            })
                            .catch(error => {
                                console.log(error);
                                if (error.message === 'No Contribution found') {
                                    this.setState({ unfoundContribution: true, loading: false, loading_failed: false });
                                } else {
                                    this.setState({ loading: false, loading_failed: true });
                                }
                            });
                    });
            })
            .catch(error => {
                this.setState({ loading: false, loading_failed: true });
            });
    };

    toggle = type => {
        this.setState(prevState => ({
            [type]: !prevState[type]
        }));
    };

    // @param sync : to update the contribution label on the backend.
    handleChangeContributionLabel = async (contributionId, label) => {
        //find the index of contribution
        const objIndex = this.state.contributions.findIndex(obj => obj.id === contributionId);
        if (this.state.contributions[objIndex].label !== label) {
            // set the label of the contribution
            const updatedObj = { ...this.state.contributions[objIndex], label: label };
            // update the contributions array
            const newContributions = [...this.state.contributions.slice(0, objIndex), updatedObj, ...this.state.contributions.slice(objIndex + 1)];
            this.setState({
                contributions: newContributions
            });
            this.props.updateContributionLabel({ id: contributionId, label: label });
            await updateResource(contributionId, label);
            toast.success('Contribution name updated successfully');
        }
    };

    handleCreateContribution = async () => {
        const newContribution = await createResource(`Contribution ${this.state.contributions.length + 1}`, [CLASSES.CONTRIBUTION]);
        const statement = await createResourceStatement(this.props.match.params.resourceId, PREDICATES.HAS_CONTRIBUTION, newContribution.id);
        this.setState({ contributions: [...this.state.contributions, { ...statement.object, statementId: statement.id }] });
        toast.success('Contribution created successfully');
    };

    toggleDeleteContribution = async contributionId => {
        const result = await Confirm({
            title: 'Are you sure?',
            message: 'Are you sure you want to delete this contribution?',
            cancelColor: 'light'
        });

        if (result) {
            const objIndex = this.state.contributions.findIndex(obj => obj.id === contributionId);
            const statementId = this.state.contributions[objIndex].statementId;
            const newContributions = this.state.contributions.filter(function(contribution) {
                return contribution.id !== contributionId;
            });
            this.setState(
                {
                    selectedContribution: newContributions[0].id
                },
                () => {
                    this.setState({
                        contributions: newContributions
                    });
                }
            );
            await deleteStatementById(statementId);
            toast.success('Contribution deleted successfully');
        }
    };

    /** PROCESSING HELPER :  Helper functions to increase code readability**/
    processObservatoryInformation(paperResource, resourceId) {
        if (
            paperResource.observatory_id &&
            paperResource.observatory_id !== '00000000-0000-0000-0000-000000000000' &&
            paperResource.created_by &&
            paperResource.created_by !== '00000000-0000-0000-0000-000000000000'
        ) {
            const observatory = getObservatoryAndOrganizationInformation(paperResource.observatory_id, paperResource.organization_id);
            const creator = getUserInformationById(paperResource.created_by);
            Promise.all([observatory, creator]).then(data => {
                this.setState({
                    observatoryInfo: {
                        ...data[0],
                        created_at: paperResource.created_at,
                        created_by: data[1],
                        extraction_method: paperResource.extraction_method
                    }
                });
            });

            getContributorsByResourceId(resourceId).then(contributors =>
                Promise.all(contributors).then(data => {
                    this.setState({ contributors: data });
                })
            );
        } else {
            // Initialize the state in case the user switch to another paper that is not linked with observatory
            this.setState({
                observatoryInfo: {},
                contributors: []
            });
        }
    }

    processPaperStatements = (paperResource, paperStatements) => {
        const paperData = getPaperData_ViewPaper(paperResource.id, paperResource.label, paperStatements);

        // Set document title
        document.title = `${paperResource.label} - ORKG`;
        this.props.loadPaper(paperData);
        this.setState({
            loading: false,
            contributions: paperData.contributions
        });
    };

    applyContributionSelectionState = () => {
        if (
            this.props.match.params.contributionId &&
            !this.state.contributions.some(el => {
                return el.id === this.props.match.params.contributionId;
            })
        ) {
            throw new Error('Contribution not found');
        }
        if (this.state.contributions[0]) {
            this.setState({
                selectedContribution:
                    this.props.match.params.contributionId &&
                    this.state.contributions.some(el => {
                        return el.id === this.props.match.params.contributionId;
                    })
                        ? this.props.match.params.contributionId
                        : this.state.contributions[0].id
            });
        } else {
            throw new Error('No Contribution found');
        }
    };

    loadAuthorsORCID = () => {
        let authors = [];
        if (this.props.viewPaper.authors.length > 0) {
            authors = this.props.viewPaper.authors
                .filter(author => author.classes && author.classes.includes(CLASSES.AUTHOR))
                .map(author => {
                    return getStatementsBySubject({ id: author.id }).then(authorStatements => {
                        return authorStatements.find(statement => statement.predicate.id === PREDICATES.HAS_ORCID);
                    });
                });
        }
        return Promise.all(authors).then(authorsORCID => {
            const authorsArray = [];
            for (const author of this.props.viewPaper.authors) {
                const orcid = authorsORCID.find(a => a.subject.id === author.id);
                if (orcid) {
                    author.orcid = orcid.object.label;
                    authorsArray.push(author);
                } else {
                    author.orcid = '';
                    authorsArray.push(author);
                }
            }
            this.props.setPaperAuthors({
                authors: authorsArray
            });
        });
    };

    /** RENDERING FUNCTION **/

    render() {
        let comingFromWizard = queryString.parse(this.props.location.search);
        comingFromWizard = comingFromWizard ? comingFromWizard.comingFromWizard === 'true' : false;

        let paperLink = '';

        if (this.props.viewPaper.url) {
            paperLink = this.props.viewPaper.url;
        } else if (this.props.viewPaper.doi && this.props.viewPaper.doi.startsWith('10.')) {
            paperLink = 'https://doi.org/' + this.props.viewPaper.doi;
        }

        return (
            <div>
                {!this.state.loading && this.state.loading_failed && <NotFound />}
                {!this.state.loading_failed && (
                    <>
                        {this.state.showHeaderBar && (
                            <PaperHeaderBar
                                paperLink={paperLink}
                                editMode={this.state.editMode}
                                toggle={this.toggle}
                                paperTitle={this.props.viewPaper.title}
                            />
                        )}
                        <VisibilitySensor onChange={this.handleShowHeaderBar}>
                            <Container className="d-flex align-items-center">
                                <h1 className="h4 mt-4 mb-4 flex-grow-1">View paper</h1>
                                <PaperMenuBar
                                    editMode={this.state.editMode}
                                    paperLink={paperLink}
                                    toggle={this.toggle}
                                    id={this.props.match.params.resourceId}
                                />
                            </Container>
                        </VisibilitySensor>

                        {this.state.editMode && (
                            <EditModeHeader className="box rounded-top">
                                <Title>
                                    Edit mode <span className="pl-2">Every change you make is automatically saved</span>
                                </Title>
                            </EditModeHeader>
                        )}
                        <Container
                            className={`box pt-md-4 pb-md-4 pl-md-5 pr-md-5 pt-sm-2 pb-sm-2 pl-sm-2 pr-sm-2 clearfix
                                ${this.state.editMode ? 'rounded-bottom' : 'rounded'}`}
                        >
                            {this.state.loading && (
                                <ContentLoader height={38} speed={2} primaryColor="#f3f3f3" secondaryColor="#ecebeb">
                                    <rect x="0" y="10" width="350" height="12" />
                                    <rect x="0" y="28" rx="5" ry="5" width="30" height="8" />
                                    <rect x="35" y="28" rx="5" ry="5" width="30" height="8" />
                                    <rect x="70" y="28" rx="5" ry="5" width="30" height="8" />
                                    <rect x="105" y="28" rx="5" ry="5" width="30" height="8" />
                                </ContentLoader>
                            )}
                            {!this.state.loading && !this.state.loading_failed && (
                                <>
                                    {comingFromWizard && (
                                        <UncontrolledAlert color="info">
                                            Help us to improve the ORKG and{' '}
                                            <a href="https://forms.gle/AgcUXuiuQzexqZmr6" target="_blank" rel="noopener noreferrer">
                                                fill out the online evaluation form
                                            </a>
                                            . Thank you!
                                        </UncontrolledAlert>
                                    )}
                                    <PaperHeader editMode={this.state.editMode} />
                                </>
                            )}
                            {!this.state.loading_failed && !this.state.unfoundContribution && (
                                <>
                                    <hr className="mt-3" />
                                    <SharePaper title={this.props.viewPaper.title} />

                                    <Contributions
                                        selectedContribution={this.state.selectedContribution}
                                        contributions={this.state.contributions}
                                        paperId={this.props.match.params.resourceId}
                                        paperTitle={this.props.viewPaper.title}
                                        enableEdit={this.state.editMode}
                                        toggleEditMode={() => this.toggle('editMode')}
                                        handleChangeContributionLabel={this.handleChangeContributionLabel}
                                        handleCreateContribution={this.handleCreateContribution}
                                        toggleDeleteContribution={this.toggleDeleteContribution}
                                        observatoryInfo={this.state.observatoryInfo}
                                        contributors={this.state.contributors}
                                    />

                                    <ComparisonPopup />
                                </>
                            )}
                            {!this.state.loading_failed && this.state.unfoundContribution && (
                                <>
                                    <hr className="mt-4 mb-5" />
                                    <Alert color="danger">Failed to load contributions.</Alert>
                                </>
                            )}
                        </Container>
                    </>
                )}

                <GizmoGraphViewModal
                    showDialog={this.state.showGraphModal}
                    toggle={() => this.toggle('showGraphModal')}
                    paperId={this.props.match.params.resourceId}
                />
            </div>
        );
    }
}

ViewPaper.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            resourceId: PropTypes.string,
            contributionId: PropTypes.string
        }).isRequired
    }).isRequired,
    resetStatementBrowser: PropTypes.func.isRequired,
    selectContribution: PropTypes.func.isRequired,
    updateContributionLabel: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired,
    viewPaper: PropTypes.object.isRequired,
    loadPaper: PropTypes.func.isRequired,
    setPaperAuthors: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    viewPaper: state.viewPaper
});

const mapDispatchToProps = dispatch => ({
    resetStatementBrowser: () => dispatch(resetStatementBrowser()),
    loadPaper: payload => dispatch(loadPaper(payload)),
    selectContribution: payload => dispatch(selectContribution(payload)),
    setPaperAuthors: payload => dispatch(setPaperAuthors(payload)),
    updateContributionLabel: payload => dispatch(updateContributionLabel(payload))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ViewPaper);
