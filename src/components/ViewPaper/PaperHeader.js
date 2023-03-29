import { faCalendar, faCheckCircle, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import AuthorBadges from 'components/Badges/AuthorBadges/AuthorBadges';
import ResearchFieldBadge from 'components/Badges/ResearchFieldBadge/ResearchFieldBadge';
import useMarkFeaturedUnlisted from 'components/MarkFeaturedUnlisted/hooks/useMarkFeaturedUnlisted';
import MarkFeatured from 'components/MarkFeaturedUnlisted/MarkFeatured/MarkFeatured';
import MarkUnlisted from 'components/MarkFeaturedUnlisted/MarkUnlisted/MarkUnlisted';
import useDeletePapers from 'components/ViewPaper/hooks/useDeletePapers';
import OpenCitations from 'components/ViewPaper/OpenCitations/OpenCitations';
import Tippy from '@tippyjs/react';
import ROUTES from 'constants/routes';
import moment from 'moment';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button, Alert } from 'reactstrap';
import { getAltMetrics } from 'services/altmetric/index';
import { loadPaper } from 'slices/viewPaperSlice';
import EditPaperDialog from './EditDialog/EditPaperDialog';

const PaperHeader = props => {
    const [isOpenEditModal, setIsOpenEditModal] = useState(false);
    const viewPaper = useSelector(state => state.viewPaper, shallowEqual);
    const isCurationAllowed = useSelector(state => state.auth.user?.isCurationAllowed);
    const userId = useSelector(state => state.auth.user?.id);
    const [deletePapers] = useDeletePapers({ paperIds: [viewPaper.paperResource.id], redirect: true });
    const [altMetrics, setAltMetrics] = useState(null);
    const dispatch = useDispatch();
    // make sure a user is signed in (not null)
    const userCreatedThisPaper = viewPaper.paperResource.created_by && userId && viewPaper.paperResource.created_by === userId;
    const showDeleteButton = props.editMode && (isCurationAllowed || userCreatedThisPaper);
    const { isFeatured, isUnlisted, handleChangeStatus } = useMarkFeaturedUnlisted({
        resourceId: viewPaper.paperResource.id,
        unlisted: viewPaper.paperResource.unlisted,
        featured: viewPaper.paperResource.featured,
    });

    useEffect(() => {
        if (!viewPaper.doi?.label) {
            return;
        }
        const loadAltMetrics = async () => {
            const altM = await getAltMetrics(viewPaper.doi?.label);
            setAltMetrics(altM);
        };
        loadAltMetrics();
    }, [viewPaper.doi?.label]);

    const handleUpdatePaper = data => {
        // TODO: the viewPaper store should be refactored to directly support the updated data that is passed
        dispatch(
            loadPaper({
                paperResource: { ...viewPaper.paperResource, label: data.paper.label },
                publicationMonth: { ...viewPaper.publicationMonth, label: data.month?.label || null, id: data.month?.id },
                publicationYear: { ...viewPaper.publicationYear, label: data.year?.label || null, id: data.year?.id },
                doi: { ...viewPaper.doi, label: data.doi?.label, id: data.doi?.id },
                authors: data.authors,
                publishedIn: data.publishedIn,
                url: { ...viewPaper.url, label: data.url?.label, id: data.url?.id },
                researchField: data.researchField,
                verified: data.isVerified,
            }),
        );
        setIsOpenEditModal(false);
    };
    const hasDoi = viewPaper.doi && viewPaper.doi.label?.startsWith('10.');

    return (
        <>
            {viewPaper.hasVersion && (
                <Alert color="warning" className="mt-1 container d-flex">
                    <div className="flex-grow-1">
                        A published version of this paper is available.{' '}
                        <Link to={reverse(ROUTES.VIEW_PAPER, { resourceId: viewPaper.hasVersion.id })}>View published version</Link>
                    </div>
                </Alert>
            )}
            <div className="d-flex align-items-start">
                <h2 className={`h4 ${viewPaper.hasVersion ? 'mt-1' : 'mt-4'} mb-3 flex-grow-1`}>
                    {viewPaper.paperResource.label ? viewPaper.paperResource.label : <em>No title</em>}{' '}
                    <MarkFeatured size="xs" featured={isFeatured} handleChangeStatus={handleChangeStatus} />
                    <div className="d-inline-block ms-1">
                        <MarkUnlisted size="xs" unlisted={isUnlisted} handleChangeStatus={handleChangeStatus} />
                    </div>
                </h2>
                {altMetrics && (
                    <div className="flex-shrink-0 me-2">
                        <small>
                            <a href={altMetrics.details_url} target="_blank" rel="noopener noreferrer">
                                <img src={altMetrics.images.small} height="60px" alt="Alt metrics icon" />
                            </a>
                        </small>
                    </div>
                )}
            </div>

            <div className="clearfix" />

            {(viewPaper.publicationMonth?.label || viewPaper.publicationYear?.label) && (
                <span className="badge bg-light me-2">
                    <Icon icon={faCalendar} /> {viewPaper.publicationMonth?.label ? moment(viewPaper.publicationMonth.label, 'M').format('MMMM') : ''}{' '}
                    {viewPaper.publicationYear?.label ? viewPaper.publicationYear.label : ''}
                </span>
            )}
            {hasDoi && <OpenCitations doi={viewPaper.doi.label} />}
            <ResearchFieldBadge researchField={viewPaper.researchField} />
            <AuthorBadges authors={viewPaper.authors} />
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
                {hasDoi && (
                    <div className="flex-shrink-0">
                        <small>
                            DOI:{' '}
                            <a href={`https://doi.org/${viewPaper.doi.label}`} target="_blank" rel="noopener noreferrer">
                                https://doi.org/{viewPaper.doi.label}
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
                {viewPaper.verified && (
                    <Tippy content="The paper metadata was verified by an ORKG curator">
                        <div className="mt-3 justify-content-end">
                            <Icon icon={faCheckCircle} className="mt-1 me-1 text-success" />
                            Verified
                        </div>
                    </Tippy>
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
                        isVerified: viewPaper.verified,
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
    editMode: PropTypes.bool.isRequired,
};

export default PaperHeader;
