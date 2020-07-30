import React from 'react';
import { Badge, Button } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faUser, faCalendar, faBars, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes';
import moment from 'moment';
import PropTypes from 'prop-types';
import EditPaperDialog from './EditDialog/EditPaperDialog';
import { CLASSES } from 'constants/graphSettings';
import { useSelector, shallowEqual } from 'react-redux';
import useDeletePapers from 'components/ViewPaper/hooks/useDeletePapers';

const PaperHeader = props => {
    const viewPaper = useSelector(state => state.viewPaper, shallowEqual);
    const role = useSelector(state => state.auth.role); //TODO: replace mocking value from (probably) user.role
    const userId = useSelector(state => state.auth.user?.id);
    const [deletePapers] = useDeletePapers({ paperIds: [viewPaper.paperResourceId], redirect: true });
    const userCreatedThisPaper = viewPaper.createdBy && userId && viewPaper.createdBy === userId; // make sure a user is signed in (not null)
    const showDeleteButton = props.editMode && (role === 'admin' || userCreatedThisPaper);

    return (
        <>
            <div className="d-flex align-items-start">
                <h2 className="h4 mt-4 mb-3 flex-grow-1">{viewPaper.title ? viewPaper.title : <em>No title</em>}</h2>
            </div>

            <div className="clearfix" />

            {viewPaper.publicationMonth || viewPaper.publicationYear ? (
                <span className="badge badge-lightblue mr-2">
                    <Icon icon={faCalendar} className="text-primary" />{' '}
                    {viewPaper.publicationMonth ? moment(viewPaper.publicationMonth, 'M').format('MMMM') : ''}{' '}
                    {viewPaper.publicationYear ? viewPaper.publicationYear : ''}
                </span>
            ) : (
                ''
            )}
            {viewPaper.researchField && (
                <Link to={reverse(ROUTES.RESEARCH_FIELD, { researchFieldId: viewPaper.researchField.id })}>
                    <span className="badge badge-lightblue mr-2 mb-2">
                        <Icon icon={faBars} className="text-primary" /> {viewPaper.researchField.label}
                    </span>
                </Link>
            )}
            {viewPaper.authors.map((author, index) =>
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
                {viewPaper.publishedIn && (
                    <div className="flex-grow-1">
                        <small>
                            Published in:{' '}
                            <Link
                                style={{ color: '#60687a', fontStyle: 'italic' }}
                                to={reverse(ROUTES.VENUE_PAGE, { venueId: viewPaper.publishedIn.id })}
                            >
                                {viewPaper.publishedIn.label}
                            </Link>
                        </small>
                    </div>
                )}
                {viewPaper.doi && viewPaper.doi.startsWith('10.') && (
                    <div className="flex-shrink-0">
                        <small>
                            DOI:{' '}
                            <a href={`https://doi.org/${viewPaper.doi}`} target="_blank" rel="noopener noreferrer">
                                {viewPaper.doi}
                            </a>
                        </small>
                    </div>
                )}
            </div>
            <div className="flex-grow-1">
                {props.editMode && <EditPaperDialog />}{' '}
                {showDeleteButton && (
                    <Button color="danger" size="sm" className="mt-2" style={{ marginLeft: 'auto' }} onClick={deletePapers}>
                        <Icon icon={faTrash} /> Delete paper
                    </Button>
                )}
            </div>
        </>
    );
};

PaperHeader.propTypes = {
    editMode: PropTypes.bool.isRequired
};

export default PaperHeader;
