import React, { Component } from 'react';
import { Container, Dropdown, DropdownToggle, DropdownItem, DropdownMenu } from 'reactstrap';
import { getStatementsBySubject, getResource } from '../../network';
import { connect } from 'react-redux';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faUser, faCalendar, faBars, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
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
import GraphViewModal from './GraphViewModal';

class ViewPaper extends Component {
    state = {
        loading: true,
        loading_failed: false,
        id: null,
        title: '',
        authorNames: [],
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
            getStatementsBySubject(resourceId).then((paperStatements) => {
                // check if type is paper
                let hasTypePaper = paperStatements.filter((statement) => statement.predicate.id === process.env.REACT_APP_PREDICATES_IS_A && statement.object.id === process.env.REACT_APP_RESOURCE_TYPES_PAPER);

                if (hasTypePaper.length === 0) {
                    throw new Error('The requested resource is not of type "paper"');
                }

                // research field
                let researchField = paperStatements.filter((statement) => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_RESEARCH_FIELD);

                if (researchField.length > 0) {
                    researchField = researchField[0]
                }

                // publication year
                let publicationYear = paperStatements.filter((statement) => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_PUBLICATION_YEAR);

                if (publicationYear.length > 0) {
                    publicationYear = publicationYear[0].object.label
                }

                // publication month
                let publicationMonth = paperStatements.filter((statement) => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_PUBLICATION_MONTH);

                if (publicationMonth.length > 0) {
                    publicationMonth = publicationMonth[0].object.label
                }

                // authors
                let authors = paperStatements.filter((statement) => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_AUTHOR);

                let authorNamesArray = [];

                if (authors.length > 0) {
                    for (let author of authors) {
                        let authorName = author.object.label;
                        authorNamesArray.push(authorName);
                    }
                }

                // contributions
                let contributions = paperStatements.filter((statement) => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_CONTRIBUTION);

                let contributionArray = [];

                if (contributions.length > 0) {
                    for (let contribution of contributions) {
                        contributionArray.push(contribution.object);
                    }
                }

                this.setState({
                    loading: false,
                    id: this.props.match.params.resourceId,
                    title: paperResource.label,
                    publicationYear,
                    publicationMonth,
                    researchField,
                    authorNames: authorNamesArray.reverse(), // statements are ordered desc, so first author is last => thus reverse
                    contributions: contributionArray.sort((a, b) => a.label.localeCompare(b.label)), // sort contributions ascending, so contribution 1, is actually the first one
                });
            }).then(() => {
                if (this.props.match.params.contributionId && !this.state.contributions.some((el) => { return el.id === this.props.match.params.contributionId; })) {
                    throw new Error('Contribution not found');
                }
                this.setState({ selectedContribution: (this.props.match.params.contributionId && this.state.contributions.some((el) => { return el.id === this.props.match.params.contributionId; })) ? this.props.match.params.contributionId : this.state.contributions[0].id });
            }).catch(error => {
                this.setState({ loading: false, loading_failed: true })
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
                                    <div className="d-flex">
                                        <h2 className="h4 mt-4 mb-3">{this.state.title ? this.state.title : <em>No title</em>}</h2>

                                        <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggleDropdown} className="mb-4 mt-4" style={{ marginLeft: 'auto'}}>
                                            <DropdownToggle color="darkblue" size="sm" >
                                                <span className="mr-2">Options</span> <Icon icon={faEllipsisV} />
                                            </DropdownToggle>
                                            <DropdownMenu>
                                                <DropdownItem onClick={() => this.toggle('showGraphModal')}>Show graph visualization</DropdownItem>
                                            </DropdownMenu>
                                        </Dropdown>
                                    </div>

                                    <div className="clearfix" />

                                    {/* TODO: change links of badges  */}
                                    <span className="badge badge-lightblue mr-2">
                                        <Icon icon={faCalendar} className="text-primary" /> {moment(this.state.publicationMonth, 'M').format('MMMM')} {this.state.publicationYear}
                                    </span>
                                    {this.state.researchField && this.state.researchField.object && (
                                        <Link to={reverse(ROUTES.RESEARCH_FIELD, { researchFieldId: this.state.researchField.object.id })} >
                                            <span className="badge badge-lightblue mr-2 mb-2">
                                                <Icon icon={faBars} className="text-primary" /> {this.state.researchField.object.label}
                                            </span>
                                        </Link>)
                                    }
                                    {this.state.authorNames.map((author, index) => (
                                        <span className="badge badge-lightblue mr-2 mb-2" key={index}>
                                            <Icon icon={faUser} className="text-primary" /> {author}
                                        </span>
                                    ))}
                                </>
                            )}
                            {!this.state.loading_failed && (
                                <>
                                    <hr className="mt-4 mb-5" />
                                    <Contributions
                                        selectedContribution={this.state.selectedContribution}
                                        contributions={this.state.contributions}
                                        paperId={this.props.match.params.resourceId}
                                        paperTitle={this.state.title}
                                    />

                                    <ComparisonPopup />
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
}

const mapStateToProps = state => ({
    viewPaper: state.viewPaper,
});

const mapDispatchToProps = dispatch => ({
    resetStatementBrowser: () => dispatch(resetStatementBrowser()),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ViewPaper);