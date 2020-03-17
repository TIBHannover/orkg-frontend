import React, { Component } from 'react';
import { Container, Button, Alert, UncontrolledAlert, ButtonGroup, Badge } from 'reactstrap';
import { getStatementsBySubject, getResource, updateResource, createResource, createResourceStatement, deleteStatementById } from '../../network';
import { connect } from 'react-redux';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faUser, faCalendar, faBars, faProjectDiagram, faPen, faTimes } from '@fortawesome/free-solid-svg-icons';
import NotFound from '../StaticPages/NotFound';
import ContentLoader from 'react-content-loader';
import Contributions from './Contributions';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import ROUTES from '../../constants/routes';
import moment from 'moment';
import PropTypes from 'prop-types';
import ComparisonPopup from 'components/ComparisonPopup/ComparisonPopup';
import { resetStatementBrowser } from '../../actions/statementBrowser';
import { loadPaper, selectContribution, setPaperAuthors } from '../../actions/viewPaper';
import GizmoGraphViewModal from './GraphView/GizmoGraphViewModal';
import queryString from 'query-string';
import { toast } from 'react-toastify';
import Confirm from 'reactstrap-confirm';
import EditPaperDialog from './EditDialog/EditPaperDialog';
import styled from 'styled-components';
import SharePaper from './SharePaper';

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
        dropdownOpen: false,
        showGraphModal: false,
        editMode: false
    };

    componentDidMount() {
        this.loadPaperData();
    }

    componentDidUpdate = prevProps => {
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

        getResource(resourceId)
            .then(paperResource => {
                getStatementsBySubject({ id: resourceId })
                    .then(paperStatements => {
                        // check if type is paper
                        if (!paperResource.classes.includes(process.env.REACT_APP_CLASSES_PAPER)) {
                            throw new Error(`The requested resource is not of class "${process.env.REACT_APP_CLASSES_PAPER}"`);
                        }

                        // research field
                        let researchField = paperStatements.filter(
                            statement => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_RESEARCH_FIELD
                        );

                        if (researchField.length > 0) {
                            researchField = researchField[0];
                        }

                        // venue
                        let publishedIn = paperStatements.filter(statement => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_VENUE);

                        if (publishedIn.length > 0) {
                            publishedIn = { ...publishedIn[0].object, statementId: publishedIn[0].id };
                        } else {
                            publishedIn = '';
                        }

                        // publication year
                        const publicationYearStatements = paperStatements.filter(
                            statement => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_PUBLICATION_YEAR
                        );
                        let publicationYearResourceId = 0;
                        let publicationYear = 0;
                        if (publicationYearStatements.length > 0) {
                            publicationYear = publicationYearStatements[0].object.label;
                            publicationYearResourceId = publicationYearStatements[0].object.id;
                        }

                        // publication month
                        const publicationMonthStatements = paperStatements.filter(
                            statement => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_PUBLICATION_MONTH
                        );
                        let publicationMonthResourceId = 0;
                        let publicationMonth = 0;

                        if (publicationMonthStatements.length > 0) {
                            publicationMonth = publicationMonthStatements[0].object.label;
                            publicationMonthResourceId = publicationMonthStatements[0].object.id;
                        }

                        // authors
                        const authors = paperStatements.filter(statement => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_AUTHOR);
                        const authorNamesArray = [];

                        if (authors.length > 0) {
                            for (const author of authors) {
                                authorNamesArray.push({
                                    id: author.object.id,
                                    statementId: author.id,
                                    class: author.object._class,
                                    label: author.object.label,
                                    classes: author.object.classes
                                });
                            }
                        }

                        // DOI
                        let doi = paperStatements.filter(statement => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_DOI);
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
                        const contributions = paperStatements.filter(
                            statement => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_CONTRIBUTION
                        );

                        const contributionArray = [];

                        if (contributions.length > 0) {
                            for (const contribution of contributions) {
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
                            publishedIn
                        });

                        this.setState({
                            loading: false,
                            contributions: contributionArray.sort((a, b) => a.label.localeCompare(b.label)) // sort contributions ascending, so contribution 1, is actually the first one
                        });
                    })
                    .then(e => {
                        // Load paper authors ORCID
                        let authors = [];
                        if (this.props.viewPaper.authors.length > 0) {
                            authors = this.props.viewPaper.authors
                                .filter(author => author.classes && author.classes.includes(process.env.REACT_APP_CLASSES_AUTHOR))
                                .map(author => {
                                    return getStatementsBySubject({ id: author.id }).then(authorStatements => {
                                        return authorStatements.find(
                                            statement => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_ORCID
                                        );
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
                    })
                    .then(e => {
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
                    })
                    .catch(error => {
                        console.log(error);
                        if (error.message === 'No Contribution found') {
                            this.setState({ unfoundContribution: true, loading: false, loading_failed: false });
                        } else {
                            this.setState({ loading: false, loading_failed: true });
                        }
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
            this.setState({ contributions: newContributions });
            await updateResource(contributionId, label);
            toast.success('Contribution name updated successfully');
        }
    };

    handleCreateContribution = async () => {
        const newContribution = await createResource(`Contribution ${this.state.contributions.length + 1}`, [
            process.env.REACT_APP_CLASSES_CONTRIBUTION
        ]);
        const statement = await createResourceStatement(
            this.props.match.params.resourceId,
            process.env.REACT_APP_PREDICATES_HAS_CONTRIBUTION,
            newContribution.id
        );
        this.setState({ contributions: [...this.state.contributions, { ...statement.object, statementId: statement.id }] });
        toast.success('Contribution cratead successfully');
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
                    this.setState({ contributions: newContributions });
                }
            );
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
                {!this.state.loading && this.state.loading_failed && <NotFound />}
                {!this.state.loading_failed && (
                    <>
                        <Container className="d-flex align-items-center">
                            <h1 className="h4 mt-4 mb-4 flex-grow-1">View paper</h1>
                            <ButtonGroup className="flex-shrink-0">
                                <Button className="flex-shrink-0" color="darkblue" size="sm" onClick={() => this.toggle('showGraphModal')}>
                                    <Icon icon={faProjectDiagram} style={{ margin: '2px 4px 0 0' }} /> Graph view
                                </Button>

                                {!this.state.editMode ? (
                                    <Button
                                        className="flex-shrink-0"
                                        style={{ marginLeft: 1 }}
                                        color="darkblue"
                                        size="sm"
                                        onClick={() => this.toggle('editMode')}
                                    >
                                        <Icon icon={faPen} /> Edit
                                    </Button>
                                ) : (
                                    <Button
                                        className="flex-shrink-0"
                                        style={{ marginLeft: 1 }}
                                        color="darkblueDarker"
                                        size="sm"
                                        onClick={() => this.toggle('editMode')}
                                    >
                                        <Icon icon={faTimes} /> Stop editing
                                    </Button>
                                )}
                            </ButtonGroup>
                        </Container>

                        {this.state.editMode && (
                            <EditModeHeader className="box">
                                <Title>
                                    Edit mode <span className="pl-2">Every change you make is automatically saved</span>
                                </Title>
                            </EditModeHeader>
                        )}
                        <Container className="box pt-md-4 pb-md-4 pl-md-5 pr-md-5 pt-sm-2 pb-sm-2 pl-sm-2 pr-sm-2   clearfix">
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
                                    <div className="d-flex align-items-start">
                                        <h2 className="h4 mt-4 mb-3 flex-grow-1">
                                            {this.props.viewPaper.title ? this.props.viewPaper.title : <em>No title</em>}
                                        </h2>
                                    </div>

                                    <div className="clearfix" />

                                    {/* TODO: change links of badges  */}
                                    {this.props.viewPaper.publicationMonth || this.props.viewPaper.publicationYear ? (
                                        <span className="badge badge-lightblue mr-2">
                                            <Icon icon={faCalendar} className="text-primary" />{' '}
                                            {this.props.viewPaper.publicationMonth
                                                ? moment(this.props.viewPaper.publicationMonth, 'M').format('MMMM')
                                                : ''}{' '}
                                            {this.props.viewPaper.publicationYear ? this.props.viewPaper.publicationYear : ''}
                                        </span>
                                    ) : (
                                        ''
                                    )}
                                    {this.props.viewPaper.researchField && this.props.viewPaper.researchField.object && (
                                        <Link to={reverse(ROUTES.RESEARCH_FIELD, { researchFieldId: this.props.viewPaper.researchField.object.id })}>
                                            <span className="badge badge-lightblue mr-2 mb-2">
                                                <Icon icon={faBars} className="text-primary" /> {this.props.viewPaper.researchField.object.label}
                                            </span>
                                        </Link>
                                    )}
                                    {this.props.viewPaper.authors.map((author, index) =>
                                        author.classes && author.classes.includes(process.env.REACT_APP_CLASSES_AUTHOR) ? (
                                            <Link key={index} to={reverse(ROUTES.AUTHOR_PAGE, { authorId: author.id })}>
                                                <Badge color="lightblue" className="mr-2 mb-2" key={index}>
                                                    <Icon icon={faUser} className="text-primary" /> {author.label}
                                                </Badge>
                                            </Link>
                                        ) : (
                                            <Badge color="lightblue" className="mr-2 mb-2" key={index}>
                                                <Icon icon={faUser} className="text-darkblue" /> {author.label}
                                            </Badge>
                                        )
                                    )}
                                    <br />
                                    <div className="d-flex justify-content-end align-items-center">
                                        {this.props.viewPaper.publishedIn && (
                                            <div className="flex-grow-1">
                                                <small>
                                                    Published in:{' '}
                                                    <Link
                                                        style={{ color: '#60687a', fontStyle: 'italic' }}
                                                        to={reverse(ROUTES.VENUE_PAGE, { venueId: this.props.viewPaper.publishedIn.id })}
                                                    >
                                                        {this.props.viewPaper.publishedIn.label}
                                                    </Link>
                                                </small>
                                            </div>
                                        )}
                                        {this.props.viewPaper.doi && this.props.viewPaper.doi.startsWith('10.') && (
                                            <div className="flex-shrink-0">
                                                <small>
                                                    DOI:{' '}
                                                    <a href={`https://doi.org/${this.props.viewPaper.doi}`} target="_blank" rel="noopener noreferrer">
                                                        {this.props.viewPaper.doi}
                                                    </a>
                                                </small>
                                            </div>
                                        )}
                                    </div>
                                    {this.state.editMode && <EditPaperDialog />}
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
    setPaperAuthors: payload => dispatch(setPaperAuthors(payload))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ViewPaper);
