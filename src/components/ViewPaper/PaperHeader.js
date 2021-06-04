import { faBars, faCalendar, faCheckCircle, faPen, faTrash, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { loadPaper } from 'actions/viewPaper';
import useDeletePapers from 'components/ViewPaper/hooks/useDeletePapers';
import { CLASSES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import moment from 'moment';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Badge, Button } from 'reactstrap';
import EditPaperDialog from './EditDialog/EditPaperDialog';
import { reverseWithSlug } from 'utils';

const PaperHeader = props => {
    const [isOpenEditModal, setIsOpenEditModal] = useState(false);
    const viewPaper = useSelector(state => state.viewPaper, shallowEqual);
    const isCurationAllowed = useSelector(state => state.auth.user?.isCurationAllowed);
    const userId = useSelector(state => state.auth.user?.id);
    const [deletePapers] = useDeletePapers({ paperIds: [viewPaper.paperResource.id], redirect: true });
    const dispatch = useDispatch();
    const userCreatedThisPaper = viewPaper.paperResource.created_by && userId && viewPaper.paperResource.created_by === userId; // make sure a user is signed in (not null)
    const showDeleteButton = props.editMode && (isCurationAllowed || userCreatedThisPaper);

    const handleUpdatePaper = data => {
        // TODO: the viewPaper store should be refactored to directly support the updated data that is passed
        dispatch(
            loadPaper({
                paperResource: { ...viewPaper.paperResource, label: data.paper.label },
                publicationMonth: { ...viewPaper.publicationMonth, label: parseInt(data.month?.label) || 0, id: data.month?.id },
                publicationYear: { ...viewPaper.publicationYear, label: parseInt(data.year?.label) || 0, id: data.year?.id },
                doi: { ...viewPaper.doi, label: data.doi?.label, id: data.doi?.id },
                authors: data.authors,
                publishedIn: data.publishedIn,
                url: { ...viewPaper.url, label: data.url?.label, id: data.url?.id },
                researchField: data.researchField,
                verified: data.isVerified
            })
        );
        setIsOpenEditModal(false);
    };

    return (
        <>
            <div className="d-flex align-items-start">
                <h2 className="h4 mt-4 mb-3 flex-grow-1">{viewPaper.paperResource.label ? viewPaper.paperResource.label : <em>No title</em>}</h2>
            </div>

            <div className="clearfix" />

            {(viewPaper.publicationMonth || viewPaper.publicationYear) && (
                <span className="badge badge-light mr-2">
                    <Icon icon={faCalendar} className="text-primary" />{' '}
                    {viewPaper.publicationMonth ? moment(viewPaper.publicationMonth.label, 'M').format('MMMM') : ''}{' '}
                    {viewPaper.publicationYear ? viewPaper.publicationYear.label : ''}
                </span>
            )}
            {viewPaper.researchField && viewPaper.researchField.id && (
                <Link
                    to={reverseWithSlug(ROUTES.RESEARCH_FIELD, { researchFieldId: viewPaper.researchField.id, slug: viewPaper.researchField.label })}
                >
                    <span className="badge badge-light mr-2 mb-2">
                        <Icon icon={faBars} className="text-primary" /> {viewPaper.researchField.label}
                    </span>
                </Link>
            )}
            {viewPaper.authors.map((author, index) =>
                author.classes && author.classes.includes(CLASSES.AUTHOR) ? (
                    <Link key={index} to={reverse(ROUTES.AUTHOR_PAGE, { authorId: author.id })}>
                        <Badge color="light" className="mr-2 mb-2" key={index}>
                            <Icon icon={faUser} className="text-primary" /> {author.label}
                        </Badge>
                    </Link>
                ) : (
                    <Badge color="light" className="mr-2 mb-2" key={index}>
                        <Icon icon={faUser} className="text-secondary" /> {author.label}
                    </Badge>
                )
            )}
            <br />
            <div className="d-flex justify-content-end align-items-center">
                {viewPaper.publishedIn && viewPaper.publishedIn.id && (
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
                {viewPaper.doi && viewPaper.doi.label.startsWith('10.') && (
                    <div className="flex-shrink-0">
                        <small>
                            DOI:{' '}
                            <a href={`https://doi.org/${viewPaper.doi.label}`} target="_blank" rel="noopener noreferrer">
                                {viewPaper.doi.label}
                            </a>
                        </small>
                    </div>
                )}
            </div>
            <div className="d-flex">
                <div className="flex-grow-1">
                    {props.editMode && (
                        <Button color="secondary" size="sm" className="mt-2" style={{ marginLeft: 'auto' }} onClick={() => setIsOpenEditModal(true)}>
                            <Icon icon={faPen} /> Edit data
                        </Button>
                    )}{' '}
                    {showDeleteButton && (
                        <Button color="danger" size="sm" className="mt-2" style={{ marginLeft: 'auto' }} onClick={deletePapers}>
                            <Icon icon={faTrash} /> Delete paper
                        </Button>
                    )}
                </div>
                {isCurationAllowed && viewPaper.verified && (
                    <div className="mt-3 justify-content-end">
                        <Icon icon={faCheckCircle} className="mt-1 mr-1 text-success" />
                        Verified
                    </div>
                )}
            </div>

            {isOpenEditModal && (
                <EditPaperDialog
                    paperData={{
                        paper: viewPaper.paperResource,
                        month: viewPaper.publicationMonth,
                        year: viewPaper.publicationYear,
                        authors: viewPaper.authors,
                        doi: viewPaper.doi,
                        publishedIn: viewPaper.publishedIn,
                        researchField: viewPaper.researchField,
                        url: viewPaper.url,
                        isVerified: viewPaper.verified
                    }}
                    afterUpdate={handleUpdatePaper}
                    isOpen={isOpenEditModal}
                    toggle={v => setIsOpenEditModal(!v)}
                />
            )}
        </>
    );
};

PaperHeader.propTypes = {
    editMode: PropTypes.bool.isRequired
};

export default PaperHeader;
