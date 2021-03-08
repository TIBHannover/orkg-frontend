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

const PaperHeader = props => {
    const [isOpenEditModal, setIsOpenEditModal] = useState(false);
    const viewPaper = useSelector(state => state.viewPaper, shallowEqual);
    const isCurationAllowed = useSelector(state => state.auth.user?.isCurationAllowed);
    const userId = useSelector(state => state.auth.user?.id);
    const [deletePapers] = useDeletePapers({ paperIds: [viewPaper.paperResourceId], redirect: true });
    const dispatch = useDispatch();
    const userCreatedThisPaper = viewPaper.createdBy && userId && viewPaper.createdBy === userId; // make sure a user is signed in (not null)
    const showDeleteButton = props.editMode && (isCurationAllowed || userCreatedThisPaper);

    const handleUpdatePaper = data => {
        // TODO: the viewPaper store should be refactored to directly support the updated data that is passed
        dispatch(
            loadPaper({
                title: data.paper.label,
                publicationMonth: parseInt(data.month?.label) || 0,
                publicationMonthResourceId: data.month?.id,
                publicationYear: parseInt(data.year?.label) || 0,
                publicationYearResourceId: data.year?.id,
                doi: data.doi?.label,
                doiResourceId: data.doi?.id,
                authors: data.authors,
                publishedIn: data.publishedIn,
                url: data.url?.label,
                urlResourceId: data.url?.id,
                researchField: data.researchField,
                verified: data.isVerified
            })
        );
        setIsOpenEditModal(false);
    };

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
            {viewPaper.researchField && viewPaper.researchField.id && (
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
            <div className="d-flex">
                <div className="flex-grow-1">
                    {props.editMode && (
                        <Button color="darkblue" size="sm" className="mt-2" style={{ marginLeft: 'auto' }} onClick={() => setIsOpenEditModal(true)}>
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
                        paper: {
                            id: viewPaper.paperResourceId,
                            label: viewPaper.title
                        },
                        month: {
                            id: viewPaper.publicationMonthResourceId,
                            label: viewPaper.publicationMonth
                        },
                        year: {
                            id: viewPaper.publicationYearResourceId,
                            label: viewPaper.publicationYear
                        },
                        authors: viewPaper.authors,
                        doi: {
                            id: viewPaper.doiResourceId,
                            label: viewPaper.doi
                        },
                        publishedIn: viewPaper.publishedIn,
                        researchField: viewPaper.researchField,
                        url: {
                            id: viewPaper.urlResourceId,
                            label: viewPaper.url
                        },
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
