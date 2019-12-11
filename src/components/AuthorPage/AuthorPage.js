import React, { Component } from 'react';
import { Container, Row, Col, Button } from 'reactstrap';
import { getStatementsByObject, getStatementsBySubjects, getStatementsBySubject } from '../../network';
import PaperCard from '../PaperCard/PaperCard';
import { get_paper_data } from 'utils';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faOrcid } from '@fortawesome/free-brands-svg-icons';
import { faSpinner, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const AuthorMetaInfo = styled.div`
    .key {
        font-weight: bolder;
    }
    .value {
        margin-bottom: 10px;
    }
`;

const AuthorIdentifier = styled.div`
    .key {
        font-weight: bolder;
        margin-bottom: 4px;
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
            page: 1,
            author: null,
            orcid: '',
            papers: [],
            isLastPageReached: false
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
            let orcidStatement = authorStatements.find(statement => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_ORCID);
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
                    ids: result.filter(statement => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_AUTHOR).map(p => p.subject.id)
                })
                    .then(papersStatements => {
                        let papers = papersStatements.map(paperStatements => {
                            return get_paper_data(paperStatements.statements);
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
                        <Container className="p-0">
                            <h1 className="h4 mt-4 mb-4">Author: {this.state.author.label}</h1>
                        </Container>
                        <Container className="p-0">
                            <Row>
                                <Col className="col-4">
                                    <div className={'box p-4 mb-3'}>
                                        <AuthorMetaInfo>
                                            <div className={'key'}>Full name</div>
                                            <div className={'value'}>{this.state.author.label}</div>
                                        </AuthorMetaInfo>
                                        {/*
                                        <AuthorMetaInfo>
                                            <div className={'key'}>Date of birth</div>
                                            <div className={'value'}>Date</div>
                                        </AuthorMetaInfo>
                                        <AuthorMetaInfo>
                                            <div className={'key'}>Place of birth</div>
                                            <div className={'value'}>Country</div>
                                        </AuthorMetaInfo>
                                        <AuthorMetaInfo>
                                            <div className={'key'}>Occupation</div>
                                            <div className={'value'}>Lab</div>
                                        </AuthorMetaInfo>
                                        */}
                                    </div>

                                    {this.state.orcid && (
                                        <div className={'box p-4'}>
                                            <h5>Identifiers</h5>
                                            <AuthorIdentifier>
                                                <div className={'key'}>
                                                    ORCID <Icon color={'#A6CE39'} icon={faOrcid} />
                                                </div>
                                                <div className={'value'}>
                                                    <a href={`https://orcid.org/${this.state.orcid}`} target="_blank" rel="noopener noreferrer">
                                                        {this.state.orcid} <Icon icon={faExternalLinkAlt} />
                                                    </a>
                                                </div>
                                            </AuthorIdentifier>
                                            {/*
                                            <AuthorIdentifier>
                                                <div className={'key'}>Scopus Author ID</div>
                                                <div className={'value'}>Scopus link</div>
                                            </AuthorIdentifier>
                                            <AuthorIdentifier>
                                                <div className={'key'}>Google Scholar author ID</div>
                                                <div className={'value'}>Google Scholar link</div>
                                            </AuthorIdentifier>
                                            */}
                                        </div>
                                    )}
                                </Col>

                                <Col className="col-8">
                                    <div className={'box p-4'}>
                                        <h5>Papers</h5>
                                        {this.state.papers.length > 0 && (
                                            <div>
                                                {this.state.papers.map(resource => {
                                                    return <PaperCard paper={{ title: resource.label, ...resource }} key={`pc${resource.id}`} />;
                                                })}
                                            </div>
                                        )}
                                        {!this.state.isNextPageLoading && this.state.hasNextPage && (
                                            <div className="text-center mt-2">
                                                <Button
                                                    size="sm"
                                                    color="darkblue"
                                                    onClick={!this.state.isNextPageLoading ? this.loadMorePapers : undefined}
                                                >
                                                    View more papers
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </Col>
                            </Row>
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
