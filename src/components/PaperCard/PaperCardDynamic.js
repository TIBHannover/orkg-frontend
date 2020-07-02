import React, { Component } from 'react';
import { Row, Col } from 'reactstrap';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faUser, faCalendar } from '@fortawesome/free-solid-svg-icons';
import ROUTES from 'constants/routes.js';
import PropTypes from 'prop-types';
import { getPublicationMonth, getPublicationYear, getAuthors } from 'utils';
import moment from 'moment';
import ContentLoader from 'react-content-loader';

const PaperCardStyled = styled.div`
    & .options {
        display: none;
    }

    &.selected {
        background: ${props => props.theme.bodyBg};
    }

    &:hover .options,
    &.selected .options {
        display: block;
    }
`;

class PaperCardDynamic extends Component {
    constructor(props) {
        super();
        this.state = { isLoading: true, paperStatements: [], optimizePaperObject: null };
    }

    componentDidMount() {
        /** this is experimental code, where each paper request its own data when paper Card is mounted **/
        // getStatementsBySubject({ id: this.props.paper.id }).then(paperStatements => {
        //     const optimizedPaperObject = getPaperDataForViewAllPapers(paperStatements);
        //     this.setState({ optimizedPaperObject: optimizedPaperObject, isLoading: false });
        // });

        if (this.props.paper.paperData && this.props.paper.paperData.statements) {
            if (this.state.optimizePaperObject === null && this.state.isLoading) {
                const optimizedPaperObject = this.getPaperDataForViewAllPapers(this.props.paper.paperData.statements);
                this.setState({ optimizedPaperObject: optimizedPaperObject, isLoading: false });
            }
        }
    }

    componentDidUpdate = () => {
        if (this.props.paper.paperData && this.props.paper.paperData.statements) {
            if (this.state.optimizePaperObject === null && this.state.isLoading) {
                const optimizedPaperObject = this.getPaperDataForViewAllPapers(this.props.paper.paperData.statements);
                this.setState({ optimizedPaperObject: optimizedPaperObject, isLoading: false });
            }
        } else {
            // just make sure that when from outside the props are removed the loading indicator is ensured!
            if (this.state.optimizedPaperObject !== null) {
                this.setState({ optimizedPaperObject: null, isLoading: true });
            }
        }
    };

    /**
     * Parse paper statements and return an OPTIMIZED paper object for View all papers
     *
     * @param {Array} paperStatements
     */
    getPaperDataForViewAllPapers = paperStatements => {
        // research field
        // publication year
        const publicationYear = getPublicationYear(paperStatements)[0]; // gets year[0] and resourceId[1]
        const publicationMonth = getPublicationMonth(paperStatements)[0]; // gets month[0] and resourceId[1]
        const authors = getAuthors(paperStatements);
        return {
            publicationYear,
            publicationMonth,
            authorNames: authors.sort((a, b) => a.created_at.localeCompare(b.created_at))
        };
    };

    render() {
        return (
            <PaperCardStyled className="list-group-item list-group-item-action">
                <Row>
                    <Col sm={12}>
                        <Link to={reverse(ROUTES.VIEW_PAPER, { resourceId: this.props.paper.id })}>
                            {this.props.paper.title ? this.props.paper.title : <em>No title</em>}
                        </Link>
                        <br />
                        {!this.state.isLoading && (
                            <small>
                                {this.state.optimizedPaperObject.authorNames && this.state.optimizedPaperObject.authorNames.length > 0 && (
                                    <>
                                        <Icon size="sm" icon={faUser} /> {this.state.optimizedPaperObject.authorNames.map(a => a.label).join(', ')}
                                    </>
                                )}
                                {(this.state.optimizedPaperObject.publicationMonth || this.state.optimizedPaperObject.publicationYear) && (
                                    <Icon size="sm" icon={faCalendar} className="ml-2 mr-1" />
                                )}
                                {this.state.optimizedPaperObject.publicationMonth && this.state.optimizedPaperObject.publicationMonth > 0
                                    ? moment(this.state.optimizedPaperObject.publicationMonth, 'M').format('MMMM')
                                    : ''}{' '}
                                {this.state.optimizedPaperObject.publicationYear}
                            </small>
                        )}
                        {/*Show Loading Dynamic data indicator if we are loading */}
                        {this.state.isLoading && (
                            <div style={{ display: 'ruby' }}>
                                <span>Loading</span>
                                <ContentLoader
                                    style={{ marginTop: '-8px', width: '8%' }}
                                    height={12}
                                    width={50}
                                    speed={2}
                                    primaryColor="#f3f3f3"
                                    secondaryColor="#ccc"
                                >
                                    <circle cx="5" cy="9" r="2" />
                                    <circle cx="10" cy="9" r="2" />
                                    <circle cx="15" cy="9" r="2" />
                                </ContentLoader>
                            </div>
                        )}
                    </Col>
                </Row>
            </PaperCardStyled>
        );
    }
}

PaperCardDynamic.propTypes = {
    paper: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string,
        authorNames: PropTypes.array,
        publicationMonth: PropTypes.string,
        publicationYear: PropTypes.string,
        paperData: PropTypes.object
    }).isRequired
};

export default PaperCardDynamic;
