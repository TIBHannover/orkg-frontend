import { Component } from 'react';
import { Container, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, Button, ListGroup } from 'reactstrap';
import { getStatementsByObject, getStatementsBySubject, getStatementsBySubjects } from 'services/backend/statements';
import PaperCard from 'components/PaperCard/PaperCard';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faOrcid } from '@fortawesome/free-brands-svg-icons';
import { faSpinner, faExternalLinkAlt, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';
import { getPaperData } from 'utils';
import { find } from 'lodash';
import PropTypes from 'prop-types';
import { PREDICATES } from 'constants/graphSettings';
import { NavLink } from 'react-router-dom';
import { Link } from 'react-router-dom';
import ContentLoader from 'react-content-loader';
import ROUTES from 'constants/routes.js';
import { reverse } from 'named-urls';

const AuthorMetaInfo = styled.div`
    .key {
        font-weight: bolder;
    }
    .value {
        margin-bottom: 10px;
    }
`;

class AuthorPage extends Component {
    constructor(props) {
        super(props);

        this.pageSize = 5;

        this.state = {
            loading: true,
            isNextPageLoading: false,
            hasNextPage: false,
            page: 0,
            author: null,
            orcid: '',
            papers: [],
            isLastPageReached: false,
            menuOpen: false
        };
    }

    componentDidMount() {
        this.loadAuthorData();
        this.loadMorePapers();
    }

    componentDidUpdate = prevProps => {
        if (this.props.match.params.authorId !== prevProps.match.params.authorId) {
            this.loadAuthorData();
            this.loadMorePapers();
        }
    };

    loadAuthorData = () => {
        // Get the author data
        getStatementsBySubject({ id: this.props.match.params.authorId }).then(authorStatements => {
            const orcidStatement = authorStatements.find(statement => statement.predicate.id === PREDICATES.HAS_ORCID);
            let orcid = null;
            if (orcidStatement) {
                orcid = orcidStatement.object.label;
            }
            if (authorStatements.length > 0) {
                this.setState({ author: authorStatements[0].subject, papers: [], loading: false, orcid: orcid }, () => {
                    document.title = `${this.state.author.label} - ORKG`;
                });
            }
        });
    };

    loadMorePapers = () => {
        this.setState({ isNextPageLoading: true });
        // Get the statements that contains the author as an object
        getStatementsByObject({
            id: this.props.match.params.authorId,
            page: this.state.page,
            items: this.pageSize,
            sortBy: 'id',
            desc: true
        }).then(result => {
            // Papers
            if (result.length > 0) {
                // Fetch the data of each paper
                getStatementsBySubjects({
                    ids: result.filter(statement => statement.predicate.id === PREDICATES.HAS_AUTHOR).map(p => p.subject.id)
                })
                    .then(papersStatements => {
                        const papers = papersStatements.map(paperStatements => {
                            const paperSubject = find(result.map(p => p.subject), { id: paperStatements.id });
                            if (paperSubject.classes.indexOf('Paper') === -1) {
                                /* the map function always returns a value so undefined is also counted as a 'paper'
                                 * so there is no logic update for hasNextPage: papers.length < this.pageSize */
                                /**  returns an empty resource for a paper >> handle in renderer **/
                                return undefined;
                            } else {
                                return getPaperData(paperSubject, paperStatements.statements);
                            }
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
                        <Container className="p-0 d-flex align-items-center">
                            <h1 className="h4 mt-4 mb-4 flex-grow-1">Author: {this.state.author.label}</h1>

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
                                <DropdownToggle size="sm" color="darkblue" className="px-3 rounded-right" style={{ marginLeft: 2 }}>
                                    <Icon icon={faEllipsisV} />
                                </DropdownToggle>
                                <DropdownMenu right>
                                    <DropdownItem tag={NavLink} exact to={reverse(ROUTES.RESOURCE, { id: this.props.match.params.authorId })}>
                                        View resource
                                    </DropdownItem>
                                </DropdownMenu>
                            </ButtonDropdown>
                        </Container>
                        <Container className="p-0">
                            <div className="box rounded p-4 mb-3">
                                <AuthorMetaInfo>
                                    <div className="key">Full name</div>
                                    <div className="value">{this.state.author.label}</div>
                                </AuthorMetaInfo>
                                {this.state.orcid && (
                                    <AuthorMetaInfo>
                                        <div className="key">
                                            ORCID <Icon color="#A6CE39" icon={faOrcid} />
                                        </div>
                                        <div className="value">
                                            <a href={`https://orcid.org/${this.state.orcid}`} target="_blank" rel="noopener noreferrer">
                                                {this.state.orcid} <Icon icon={faExternalLinkAlt} />
                                            </a>
                                        </div>
                                    </AuthorMetaInfo>
                                )}
                            </div>
                        </Container>
                        <Container className="d-flex align-items-center mt-4 mb-4">
                            <div className="d-flex flex-grow-1">
                                <h1 className="h5 flex-shrink-0 mb-0">Papers</h1>
                            </div>
                        </Container>
                        <Container className="p-0">
                            {this.state.papers.length > 0 && (
                                <ListGroup>
                                    {this.state.papers.map(paper => {
                                        return (
                                            paper && (
                                                <PaperCard
                                                    paper={{
                                                        id: paper.id,
                                                        title: paper.label,
                                                        ...paper
                                                    }}
                                                    key={`pc${paper.id}`}
                                                />
                                            )
                                        );
                                    })}
                                    {!this.state.isNextPageLoading && this.state.hasNextPage && (
                                        <div
                                            style={{ cursor: 'pointer' }}
                                            className="list-group-item list-group-item-action text-center"
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
                                    {!this.state.hasNextPage && this.state.isLastPageReached && this.state.page !== 1 && (
                                        <div className="text-center mt-3">You have reached the last page.</div>
                                    )}
                                </ListGroup>
                            )}
                            {this.state.papers.length === 0 && !this.state.isNextPageLoading && (
                                <div>
                                    <div className="p-5 text-center mt-4 mb-4">
                                        There are no papers for this research field, yet.
                                        <br />
                                        <br />
                                        <Link to={ROUTES.ADD_PAPER.GENERAL_DATA}>
                                            <Button size="sm" color="primary " className="mr-3">
                                                Add paper
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            )}
                            {this.state.isNextPageLoading && (
                                <div className={`text-center mt-4 mb-4 ${this.state.page === 0 ? 'p-5 container box rounded' : ''}`}>
                                    {this.state.page !== 0 && (
                                        <>
                                            <Icon icon={faSpinner} spin /> Loading
                                        </>
                                    )}
                                    {this.state.page === 0 && (
                                        <div className="text-left">
                                            <ContentLoader
                                                speed={2}
                                                width={400}
                                                height={50}
                                                viewBox="0 0 400 50"
                                                style={{ width: '100% !important' }}
                                                backgroundColor="#f3f3f3"
                                                foregroundColor="#ecebeb"
                                            >
                                                <rect x="0" y="0" rx="3" ry="3" width="400" height="20" />
                                                <rect x="0" y="25" rx="3" ry="3" width="300" height="20" />
                                            </ContentLoader>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Container>
                    </div>
                )}
            </>
        );
    }
}

AuthorPage.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            authorId: PropTypes.string
        }).isRequired
    }).isRequired
};

export default AuthorPage;
