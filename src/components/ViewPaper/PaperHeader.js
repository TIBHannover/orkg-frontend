import React, { Component } from 'react';
import { Badge } from 'reactstrap';
import { connect } from 'react-redux';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faUser, faCalendar, faBars } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes';
import moment from 'moment';
import PropTypes from 'prop-types';
import EditPaperDialog from './EditDialog/EditPaperDialog';
import { CLASSES } from 'constants/graphSettings';

class PaperHeader extends Component {
    render() {
        return (
            <>
                <div className="d-flex align-items-start">
                    <h2 className="h4 mt-4 mb-3 flex-grow-1">{this.props.viewPaper.title ? this.props.viewPaper.title : <em>No title</em>}</h2>
                </div>

                <div className="clearfix" />

                {this.props.viewPaper.publicationMonth || this.props.viewPaper.publicationYear ? (
                    <span className="badge badge-lightblue mr-2">
                        <Icon icon={faCalendar} className="text-primary" />{' '}
                        {this.props.viewPaper.publicationMonth ? moment(this.props.viewPaper.publicationMonth, 'M').format('MMMM') : ''}{' '}
                        {this.props.viewPaper.publicationYear ? this.props.viewPaper.publicationYear : ''}
                    </span>
                ) : (
                    ''
                )}
                {this.props.viewPaper.researchField && (
                    <Link to={reverse(ROUTES.RESEARCH_FIELD, { researchFieldId: this.props.viewPaper.researchField.id })}>
                        <span className="badge badge-lightblue mr-2 mb-2">
                            <Icon icon={faBars} className="text-primary" /> {this.props.viewPaper.researchField.label}
                        </span>
                    </Link>
                )}
                {this.props.viewPaper.authors.map((author, index) =>
                    author.classes && author.classes.includes(CLASSES.AUTHOR) ? (
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
                {this.props.editMode && <EditPaperDialog />}
            </>
        );
    }
}

PaperHeader.propTypes = {
    viewPaper: PropTypes.object.isRequired,
    editMode: PropTypes.bool.isRequired
};

const mapStateToProps = state => ({
    viewPaper: state.viewPaper
});

const mapDispatchToProps = dispatch => ({});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PaperHeader);
