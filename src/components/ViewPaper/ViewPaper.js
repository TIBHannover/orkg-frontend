import React, { Component } from 'react';
import { Container, Button, Alert, UncontrolledAlert, ButtonGroup } from 'reactstrap';
import { getStatementsBySubject, getResource, updateResource, createResource, createResourceStatement, deleteStatementById } from '../../network';
import { connect } from 'react-redux';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faUser, faCalendar, faBars, faProjectDiagram, faPen, faCheck } from '@fortawesome/free-solid-svg-icons';
import NotFound from '../StaticPages/NotFound';
import ContentLoader from 'react-content-loader'
import Contributions from './Contributions';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import ROUTES from '../../constants/routes';
import moment from 'moment'
import * as PropTypes from 'prop-types';
import ComparisonPopup from './ComparisonPopup';
import { resetStatementBrowser } from '../../actions/statementBrowser';
import { loadPaper, selectContribution } from '../../actions/viewPaper';
// import GraphViewModal from './GraphViewModal'; // old Graph View Modal
import GizmoGraphViewModal from './GizmoGraphViewModal';
import queryString from 'query-string';
import { toast } from 'react-toastify';
import Confirm from 'reactstrap-confirm';
import EditPaperDialog from './EditDialog/EditPaperDialog';
import styled from 'styled-components';

export const EditModeHeader = styled(Container)`
    background-color: #80869B!important;
    color:#fff;
    padding: 8px 25px!important;
    display:flex;
    align-items: center;
`;

export const Title = styled.div`
    font-size:1.1rem;
    flex-grow:1;
`;

class ViewPaper extends Component {
    state = {
        loading: true,
        loading_failed: false,
        unfoundContribution: false,
        contributions: [],
        selectedContribution: '',
        dropdownOpen: false,
        showGraphModal: false,
        editMode: false,
    };

    componentDidMount() {
        this.loadPaperData();
    }

    componentDidUpdate = (prevProps) => {
        if (this.props.match.params.resourceId !== prevProps.match.params.resourceId) {
            this.loadPaperData();
        } else if (this.props.match.params.contributionId !== prevProps.match.params.contributionId) {
            this.setState({ selectedContribution: this.props.match.params.contributionId });
        }
    };

    loadPaperData = () => {
        this.setState({ loading: true });
        const resourceId = this.props.match.params.resourceId;

        this.props.resetStatementBrowser();

        getResource(resourceId).then((paperResource) => {
            getStatementsBySubject({ id: resourceId }).then((paperStatements) => {
                // check if type is paper
                if (!paperResource.classes.includes(process.env.REACT_APP_CLASSES_PAPER)) {
                    throw new Error(`The requested resource is not of class "${process.env.REACT_APP_CLASSES_PAPER}"`);
                }

                // research field
                let researchField = paperStatements.filter((statement) => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_RESEARCH_FIELD);

                if (researchField.length > 0) {
                    researchField = researchField[0]
                }

                // publication year
                let publicationYearStatements = paperStatements.filter((statement) => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_PUBLICATION_YEAR);
                let publicationYearResourceId = 0;
                let publicationYear = 0;
                if (publicationYearStatements.length > 0) {
                    publicationYear = publicationYearStatements[0].object.label;
                    publicationYearResourceId = publicationYearStatements[0].object.id;
                }

                // publication month
                let publicationMonthStatements = paperStatements.filter((statement) => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_PUBLICATION_MONTH);
                let publicationMonthResourceId = 0;
                let publicationMonth = 0;

                if (publicationMonthStatements.length > 0) {
                    publicationMonth = publicationMonthStatements[0].object.label;
                    publicationMonthResourceId = publicationMonthStatements[0].object.id;
                }

                // authors
                let authors = paperStatements.filter((statement) => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_AUTHOR);
                let authorNamesArray = [];

                if (authors.length > 0) {
                    for (let author of authors) {
                        authorNamesArray.push({
                            id: author.id,
                            label: author.object.label
                        });
                    }
                }

                // DOI
                let doi = paperStatements.filter((statement) => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_DOI);
                let doiResourceId = 0;

                if (doi.length > 0) {
                    doiResourceId = doi[0].object.id;
                    doi = doi[0].object.label;

                    if (doi.includes('10.') && !doi.startsWith('10.')) {
                        doi = doi.substring(doi.indexOf('10.'));
                    }
                } else {
                    doi = null;
                }

                // contributions
                let contributions = paperStatements.filter((statement) => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_CONTRIBUTION);

                let contributionArray = [];

                if (contributions.length > 0) {
                    for (let contribution of contributions) {
                        contributionArray.push({ ...contribution.object, statementId: contribution.id });
                    }
                }

                // Set document title
                document.title = `${paperResource.label} - ORKG`;

                this.props.loadPaper({
                    title: paperResource.label,
                    paperResourceId: paperResource.id,
                    authors: authorNamesArray.reverse(), // statements are ordered desc, so first author is last => thus reverse
                    publicationMonth: parseInt(publicationMonth),
                    publicationMonthResourceId,
                    publicationYear: parseInt(publicationYear),
                    publicationYearResourceId,
                    doi,
                    doiResourceId,
                    researchField,
                });

                this.setState({
                    loading: false,
                    contributions: contributionArray.sort((a, b) => a.label.localeCompare(b.label)), // sort contributions ascending, so contribution 1, is actually the first one
                });
            }).then((e) => {
                if (this.props.match.params.contributionId && !this.state.contributions.some((el) => { return el.id === this.props.match.params.contributionId; })) {
                    throw new Error('Contribution not found');
                }
                if (this.state.contributions[0]) {
                    this.setState({ selectedContribution: (this.props.match.params.contributionId && this.state.contributions.some((el) => { return el.id === this.props.match.params.contributionId; })) ? this.props.match.params.contributionId : this.state.contributions[0].id });
                } else {
                    throw new Error('No Contribution found');
                }
            }).catch(error => {
                if (error.message === 'No Contribution found') {
                    this.setState({ unfoundContribution: true, loading: false, loading_failed: false })
                }
                else {
                    this.setState({ loading: false, loading_failed: true })
                }
            });
        }).catch(error => {
            this.setState({ loading: false, loading_failed: true })
        });
    };

    toggle = (type) => {
        this.setState(prevState => ({
            [type]: !prevState[type],
        }));
    };

    // @param sync : to update the contribution label on the backend.
    handleChangeContributionLabel = async (contributionId, label, sync = false) => {
        //find the index of contribution 
        const objIndex = this.state.contributions.findIndex(obj => obj.id === contributionId);
        if (this.state.contributions[objIndex].label !== label) {
            // set the label of the contribution
            const updatedObj = { ...this.state.contributions[objIndex], label: label };
            // update the contributions array
            let newContributions = [
                ...this.state.contributions.slice(0, objIndex),
                updatedObj,
                ...this.state.contributions.slice(objIndex + 1),
            ];
            this.setState({ contributions: newContributions })
        }
        if (sync) {
            await updateResource(contributionId, label);
            toast.success('Contribution name updated successfully');
        }

    };

    handleCreateContribution = async () => {
        let newContribution = await createResource(`Contribution ${this.state.contributions.length + 1}`);
        let statement = await createResourceStatement(this.props.match.params.resourceId, process.env.REACT_APP_PREDICATES_HAS_CONTRIBUTION, newContribution.id);
        this.setState({ contributions: [...this.state.contributions, { ...statement.object, statementId: statement.id }] });
        toast.success('Contribution created successfully');
    };

    toggleDeleteContribution = async (contributionId) => {
        let result = await Confirm({
            title: 'Are you sure?',
            message: 'Are you sure you want to delete this contribution?',
            cancelColor: 'light'
        });

        if (result) {
            const objIndex = this.state.contributions.findIndex(obj => obj.id === contributionId);
            let statementId = this.state.contributions[objIndex].statementId;
            let newContributions = this.state.contributions.filter(function (contribution) {
                return contribution.id !== contributionId
            });
            this.setState({
                selectedContribution: newContributions[0].id,
            }, () => {
                this.setState({ contributions: newContributions });
            });
            await deleteStatementById(statementId);
            toast.success('Contribution deleted successfully');
        }
    };

    toggleDropdown = () => {
        this.setState(prevState => ({
            dropdownOpen: !prevState.dropdownOpen
        }));
    };

    render() {
        let comingFromWizard = queryString.parse(this.props.location.search);
        comingFromWizard = comingFromWizard ? comingFromWizard.comingFromWizard === 'true' : false;

        return (
            <div>
                {!this.state.loading && this.state.loading_failed && (
                    <NotFound />
                )}
                {!this.state.loading_failed && (
                    <>
                        <Container className="p-0 d-flex align-items-center">
                            <h1 className="h4 mt-4 mb-4 flex-grow-1">View paper</h1>
                            <ButtonGroup className="flex-shrink-0">
                                <Button
                                    className="flex-shrink-0"
                                    color="darkblue"
                                    size="sm"
                                    onClick={() => this.toggle('showGraphModal')}
                                >
                                    <Icon icon={faProjectDiagram} style={{ margin: '2px 4px 0 0' }} /> Graph view
                                </Button>

                                {!this.state.editMode ?
                                    <Button
                                        className="flex-shrink-0"
                                        style={{ marginLeft: 1 }}
                                        color="darkblue"
                                        size="sm"
                                        onClick={() => this.toggle('editMode')}
                                    >
                                        <Icon icon={faPen} /> Edit
                                    </Button>
                                    :
                                    <Button
                                        className="flex-shrink-0"
                                        style={{ marginLeft: 1 }}
                                        color="darkblueDarker"
                                        size="sm"
                                        onClick={() => this.toggle('editMode')}
                                    >
                                        <Icon icon={faCheck} /> Finish
                                    </Button>
                                }

                            </ButtonGroup>
                        </Container>


                        {this.state.editMode && (
                            <EditModeHeader className="box">
                                <Title>Edit mode</Title>
                            </EditModeHeader>
                        )}
                        <Container className="box pt-4 pb-4 pl-5 pr-5 clearfix ">

                            {this.state.loading && (
                                <ContentLoader
                                    height={38}
                                    speed={2}
                                    primaryColor="#f3f3f3"
                                    secondaryColor="#ecebeb"
                                >
                                    <rect x="0" y="10" width="350" height="12" />
                                    <rect x="0" y="28" rx="5" ry="5" width="30" height="8" />
                                    <rect x="35" y="28" rx="5" ry="5" width="30" height="8" />
                                    <rect x="70" y="28" rx="5" ry="5" width="30" height="8" />
                                    <rect x="105" y="28" rx="5" ry="5" width="30" height="8" />
                                </ContentLoader>
                            )}
                            {!this.state.loading && !this.state.loading_failed && (
                                <>
                                    {comingFromWizard &&
                                        (
                                            <UncontrolledAlert color="info">
                                                Help us to improve the ORKG and <a href="https://forms.gle/AgcUXuiuQzexqZmr6" target="_blank" rel="noopener noreferrer">fill out the online evaluation form</a>. Thank you!
                                            </UncontrolledAlert>
                                        )}
                                    <div className="d-flex align-items-start">
                                        <h2 className="h4 mt-4 mb-3 flex-grow-1">{this.props.viewPaper.title ? this.props.viewPaper.title : <em>No title</em>}</h2>
                                    </div>

                                    <div className="clearfix" />

                                    {/* TODO: change links of badges  */}
                                    {(this.props.viewPaper.publicationMonth || this.props.viewPaper.publicationYear) ? (
                                        <span className="badge badge-lightblue mr-2">
                                            <Icon icon={faCalendar} className="text-primary" /> {this.props.viewPaper.publicationMonth ? moment(this.props.viewPaper.publicationMonth, 'M').format('MMMM') : ''} {this.props.viewPaper.publicationYear ? this.props.viewPaper.publicationYear : ''}
                                        </span>
                                    ) : ''}
                                    {this.props.viewPaper.researchField && this.props.viewPaper.researchField.object && (
                                        <Link to={reverse(ROUTES.RESEARCH_FIELD, { researchFieldId: this.props.viewPaper.researchField.object.id })} >
                                            <span className="badge badge-lightblue mr-2 mb-2">
                                                <Icon icon={faBars} className="text-primary" /> {this.props.viewPaper.researchField.object.label}
                                            </span>
                                        </Link>)
                                    }
                                    {this.props.viewPaper.authors.map((author, index) => (
                                        <span className="badge badge-lightblue mr-2 mb-2" key={index}>
                                            <Icon icon={faUser} className="text-primary" /> {author.label}
                                        </span>
                                    ))}
                                    <br />
                                    <div className="d-flex justify-content-end align-items-center">
                                        {this.state.editMode && (
                                            <EditPaperDialog />
                                        )}
                                        {this.props.viewPaper.doi && this.props.viewPaper.doi.startsWith('10.') && <div className="flex-shrink-0"><small>DOI: <a href={`https://doi.org/${this.props.viewPaper.doi}`} target="_blank" rel="noopener noreferrer">{this.props.viewPaper.doi}</a></small></div>}
                                    </div>
                                </>
                            )}
                            {!this.state.loading_failed && !this.state.unfoundContribution && (
                                <>
                                    <hr className="mt-4 mb-5" />
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
                                    />

                                    <ComparisonPopup />
                                </>
                            )}
                            {!this.state.loading_failed && this.state.unfoundContribution && (
                                <>
                                    <hr className="mt-4 mb-5" />
                                    <Alert color="danger">
                                        Failed to load contributions.
                                    </Alert>
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
            contributionId: PropTypes.string,
        }).isRequired,
    }).isRequired,
    resetStatementBrowser: PropTypes.func.isRequired,
    selectContribution: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired,
    viewPaper: PropTypes.object.isRequired,
    loadPaper: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
    viewPaper: state.viewPaper,
});

const mapDispatchToProps = dispatch => ({
    resetStatementBrowser: () => dispatch(resetStatementBrowser()),
    loadPaper: (payload) => dispatch(loadPaper(payload)),
    selectContribution: (payload) => dispatch(selectContribution(payload)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ViewPaper);
