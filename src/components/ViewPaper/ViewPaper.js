import React, { Component } from 'react';
import { Container, Button, Alert, UncontrolledAlert } from 'reactstrap';
import { getStatementsBySubject, getResource } from '../../network';
import { connect } from 'react-redux';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faUser, faCalendar, faBars, faProjectDiagram } from '@fortawesome/free-solid-svg-icons';
import NotFound from '../StaticPages/NotFound';
import ContentLoader from 'react-content-loader'
import Contributions from './Contributions';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import ROUTES from '../../constants/routes';
import moment from 'moment'
import PropTypes from 'prop-types';
import ComparisonPopup from './ComparisonPopup';
import { resetStatementBrowser } from '../../actions/statementBrowser';
import { loadPaper } from '../../actions/viewPaper';
import GraphViewModal from './GraphViewModal';
import queryString from 'query-string';
import EditPaperDialog from './EditDialog/EditPaperDialog';

class ViewPaper extends Component {
    state = {
        loading: true,
        loading_failed: false,
        unfoundContribution: false,
        contributions: [],
        selectedContribution: '',
        dropdownOpen: false,
        showGraphModal: false,
    }

    componentDidMount() {
        this.loadPaperData();
    }

    componentDidUpdate = (prevProps) => {
        if (this.props.match.params.resourceId !== prevProps.match.params.resourceId) {
            this.loadPaperData();
        } else if (this.props.match.params.contributionId !== prevProps.match.params.contributionId) {
            this.setState({ selectedContribution: this.props.match.params.contributionId });
        }
    }

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
                console.log('test');
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
                        contributionArray.push(contribution.object);
                    }
                }

                // Set document title
                document.title = `${paperResource.label} - ORKG`;

                this.props.loadPaper({
                    title: paperResource.label,
                    paperResourceId: paperResource.id,
                    authors: authorNamesArray.reverse(), // statements are ordered desc, so first author is last => thus reverse
                    publicationMonth,
                    publicationMonthResourceId,
                    publicationYear,
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
    }

    toggle = (type) => {
        this.setState(prevState => ({
            [type]: !prevState[type],
        }));
    }

    toggleDropdown = () => {
        this.setState(prevState => ({
            dropdownOpen: !prevState.dropdownOpen
        }));
    }

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
                        <Container className="p-0">
                            <h1 className="h4 mt-4 mb-4">View paper</h1>
                        </Container>
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
                                        <h2 className="h4 mt-4 mb-3">{this.props.viewPaper.title ? this.props.viewPaper.title : <em>No title</em>}</h2>

                                        {/*<Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggleDropdown} className="mb-4 mt-4" style={{ marginLeft: 'auto' }}>
                                            <DropdownToggle color="darkblue" size="sm" >
                                                <span className="mr-2">View</span> <Icon icon={faEllipsisV} />
                                            </DropdownToggle>
                                            <DropdownMenu>
                                                <DropdownItem onClick={() => this.toggle('showGraphModal')}>Show graph visualization</DropdownItem>
                                            </DropdownMenu>
                                        </Dropdown>*/}

                                        <Button
                                            color="darkblue"
                                            size="sm"
                                            className="mb-4 mt-4 ml-2 float-right flex-shrink-0"
                                            style={{ marginLeft: 'auto' }}
                                            onClick={() => this.toggle('showGraphModal')}
                                        >
                                            <Icon icon={faProjectDiagram} className="mr-1" /> View graph
                                        </Button>
                                        
                                        <EditPaperDialog />
                                    </div>

                                    <div className="clearfix" />

                                    {/* TODO: change links of badges  */}
                                    <span className="badge badge-lightblue mr-2">
                                        <Icon icon={faCalendar} className="text-primary" /> {this.props.viewPaper.publicationMonth && this.props.viewPaper.publicationMonth.length > 0 && moment(this.props.viewPaper.publicationMonth, 'M').format('MMMM')} {this.props.viewPaper.publicationYear}
                                    </span>
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
                                    {this.props.viewPaper.doi && this.props.viewPaper.doi.startsWith('10.') && <div style={{ textAlign: 'right' }}><small>DOI: <a href={`https://doi.org/${this.props.viewPaper.doi}`} target="_blank" rel="noopener noreferrer">{this.props.viewPaper.doi}</a></small></div>}
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

                <GraphViewModal
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
    location: PropTypes.object.isRequired,
    viewPaper: PropTypes.object.isRequired,
    loadPaper: PropTypes.func.isRequired,
}

const mapStateToProps = state => ({
    viewPaper: state.viewPaper,
});

const mapDispatchToProps = dispatch => ({
    resetStatementBrowser: () => dispatch(resetStatementBrowser()),
    loadPaper: (payload) => dispatch(loadPaper(payload)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ViewPaper);