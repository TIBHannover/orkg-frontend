import { Component } from 'react';
import { Container, Button, Card, CardText, CardBody, CardHeader, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { Link } from 'react-router-dom';
import { getStatementsByObject, getStatementsBySubjects } from 'services/backend/statements';
import { getResource } from 'services/backend/resources';
import ROUTES from 'constants/routes.js';
import PaperCard from 'components/PaperCard/PaperCard';
import { getPaperData } from 'utils';
import { find } from 'lodash';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import { PREDICATES } from 'constants/graphSettings';
import { NavLink } from 'react-router-dom';
import { reverse } from 'named-urls';

class VenuePage extends Component {
    constructor(props) {
        super(props);

        this.pageSize = 25;

        this.state = {
            loading: true,
            isNextPageLoading: false,
            hasNextPage: false,
            page: 0,
            venue: null,
            papers: [],
            isLastPageReached: false,
            menuOpen: false
        };
    }

    componentDidMount() {
        this.loadVenueData();
        this.loadMorePapers();
    }

    componentDidUpdate = prevProps => {
        if (this.props.match.params.venueId !== prevProps.match.params.venueId) {
            this.setState({
                loading: true,
                isNextPageLoading: false,
                hasNextPage: false,
                page: 0,
                venue: null,
                papers: [],
                isLastPageReached: false
            });
            this.loadVenueData();
            this.loadMorePapers();
        }
    };

    loadVenueData = () => {
        // Get the venue
        getResource(this.props.match.params.venueId).then(result => {
            this.setState({ venue: result, papers: [], loading: false }, () => {
                document.title = `${this.state.venue.label} - ORKG`;
            });
        });
    };

    loadMorePapers = () => {
        this.setState({ isNextPageLoading: true });
        // Get the statements that contains the venue as an object
        getStatementsByObject({
            id: this.props.match.params.venueId,
            page: this.state.page,
            items: this.pageSize,
            sortBy: 'created_at',
            desc: true
        }).then(result => {
            // Papers
            if (result.length > 0) {
                // Fetch the data of each paper
                getStatementsBySubjects({
                    ids: result.filter(statement => statement.predicate.id === PREDICATES.HAS_VENUE).map(p => p.subject.id)
                })
                    .then(papersStatements => {
                        const papers = papersStatements.map(paperStatements => {
                            const paperSubject = find(result.map(p => p.subject), { id: paperStatements.id });
                            return getPaperData(paperSubject, paperStatements.statements);
                        });
                        this.setState({
                            papers: [...this.state.papers, ...papers],
                            isNextPageLoading: false,
                            hasNextPage: papers.length < this.pageSize || papers.length === 0 ? false : true,
                            page: this.state.page + 1
                        });
                    })
                    .catch(error => {
                        this.setState({
                            isNextPageLoading: false,
                            hasNextPage: false,
                            isLastPageReached: true
                        });
                        console.log(error);
                    });
            } else {
                this.setState({
                    isNextPageLoading: false,
                    hasNextPage: false,
                    isLastPageReached: true
                });
            }
        });
    };

    render() {
        return (
            <>
                {this.state.loading && (
                    <div className="text-center mt-4 mb-4">
                        <Icon icon={faSpinner} spin /> Loading
                    </div>
                )}
                {!this.state.loading && (
                    <div>
                        <Container className="d-flex align-items-center">
                            <h1 className="h4 mt-4 mb-4 flex-grow-1">Venue</h1>

                            <ButtonDropdown
                                isOpen={this.state.menuOpen}
                                toggle={() =>
                                    this.setState(prevState => ({
                                        menuOpen: !prevState.menuOpen
                                    }))
                                }
                                nav
                                inNavbar
                            >
                                <DropdownToggle size="sm" color="secondary" className="px-3 rounded-right" style={{ marginLeft: 2 }}>
                                    <Icon icon={faEllipsisV} />
                                </DropdownToggle>
                                <DropdownMenu right>
                                    <DropdownItem tag={NavLink} exact to={reverse(ROUTES.RESOURCE, { id: this.props.match.params.venueId })}>
                                        View resource
                                    </DropdownItem>
                                </DropdownMenu>
                            </ButtonDropdown>
                        </Container>
                        <Container className="p-0">
                            <Card>
                                <CardHeader>
                                    {/* TODO: Show the total number of papers when number of items is provided with the paginated result
                                        <div className="float-right"><b>{this.state.papers.length}</b> Papers</div>
                                    */}
                                    <h3 className="h4 mt-4 mb-4">{this.state.venue && this.state.venue.label}</h3>
                                </CardHeader>
                                <CardBody>
                                    <CardText>
                                        List of papers in <i>{this.state.venue && this.state.venue.label}</i> venue
                                    </CardText>
                                </CardBody>
                            </Card>
                        </Container>
                        <br />
                        <Container className="p-0">
                            {this.state.papers.length > 0 && (
                                <div>
                                    {this.state.papers.map(resource => {
                                        return <PaperCard paper={{ title: resource.label, ...resource }} key={`pc${resource.id}`} />;
                                    })}
                                </div>
                            )}
                            {this.state.papers.length === 0 && !this.state.isNextPageLoading && (
                                <div className="text-center mt-4 mb-4">
                                    There are no articles for this venue, yet.
                                    <br />
                                    Start the graphing in ORKG by sharing a paper.
                                    <br />
                                    <br />
                                    <Link to={ROUTES.ADD_PAPER.GENERAL_DATA}>
                                        <Button size="sm" color="primary " className="mr-3">
                                            Share paper
                                        </Button>
                                    </Link>
                                </div>
                            )}
                            {this.state.isNextPageLoading && (
                                <div className="text-center mt-4 mb-4">
                                    <Icon icon={faSpinner} spin /> Loading
                                </div>
                            )}
                            {!this.state.isNextPageLoading && this.state.hasNextPage && (
                                <div
                                    style={{ cursor: 'pointer' }}
                                    className="list-group-item list-group-item-action text-center mt-2"
                                    onClick={!this.state.isNextPageLoading ? this.loadMorePapers : undefined}
                                    onKeyDown={e =>
                                        e.keyCode === 13 ? (!this.state.isNextPageLoading ? this.loadMorePapers : undefined) : undefined
                                    }
                                    role="button"
                                    tabIndex={0}
                                >
                                    Load more papers
                                </div>
                            )}
                            {!this.state.hasNextPage && this.state.isLastPageReached && (
                                <div className="text-center mt-3">You have reached the last page.</div>
                            )}
                        </Container>
                    </div>
                )}
            </>
        );
    }
}

VenuePage.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            venueId: PropTypes.string
        }).isRequired
    }).isRequired
};

export default VenuePage;
