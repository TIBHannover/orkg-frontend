import { faCalendar, faCheckCircle, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import { reverse } from 'named-urls';
import Link from 'next/link';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Alert, Button } from 'reactstrap';

import AuthorBadges from '@/components/Badges/AuthorBadges/AuthorBadges';
import ResearchFieldBadge from '@/components/Badges/ResearchFieldBadge/ResearchFieldBadge';
import Tooltip from '@/components/FloatingUI/Tooltip';
import useAuthentication from '@/components/hooks/useAuthentication';
import useMarkFeaturedUnlisted from '@/components/MarkFeaturedUnlisted/hooks/useMarkFeaturedUnlisted';
import MarkFeatured from '@/components/MarkFeaturedUnlisted/MarkFeatured/MarkFeatured';
import MarkUnlisted from '@/components/MarkFeaturedUnlisted/MarkUnlisted/MarkUnlisted';
import EditPaperModal from '@/components/PaperForm/EditPaperModal';
import PaperTitle from '@/components/PaperTitle/PaperTitle';
import ConditionalWrapper from '@/components/Utils/ConditionalWrapper';
import useDeletePapers from '@/components/ViewPaper/hooks/useDeletePapers';
import OpenCitations from '@/components/ViewPaper/OpenCitations/OpenCitations';
import { VISIBILITY } from '@/constants/contentTypes';
import ROUTES from '@/constants/routes';
import { getAltMetrics } from '@/services/altmetric/index';
import { loadPaper } from '@/slices/viewPaperSlice';

const PaperHeader = (props) => {
    const [isOpenEditModal, setIsOpenEditModal] = useState(false);
    const viewPaper = useSelector((state) => state.viewPaper.paper, shallowEqual);
    const version = useSelector((state) => state.viewPaper.version);
    const { user, isCurationAllowed } = useAuthentication();
    const userId = user?.id;
    const { deletePapers } = useDeletePapers({ paperIds: [viewPaper.id], redirect: true });
    const [altMetrics, setAltMetrics] = useState(null);
    const dispatch = useDispatch();
    // make sure a user is signed in (not null)
    const userCreatedThisPaper = viewPaper.created_by && userId && viewPaper.created_by === userId;
    const showDeleteButton = props.editMode && (isCurationAllowed || userCreatedThisPaper);
    const { isFeatured, isUnlisted, handleChangeStatus } = useMarkFeaturedUnlisted({
        resourceId: viewPaper.id,
        unlisted: viewPaper.visibility === VISIBILITY.UNLISTED,
        featured: viewPaper.visibility === VISIBILITY.FEATURED,
    });

    useEffect(() => {
        if (!viewPaper.identifiers?.doi?.[0]) {
            return;
        }
        const loadAltMetrics = async () => {
            const altM = await getAltMetrics(viewPaper.identifiers?.doi?.[0]);
            setAltMetrics(altM);
        };
        loadAltMetrics();
    }, [viewPaper.identifiers?.doi]);

    const handleUpdatePaper = (data) => {
        dispatch(loadPaper(data));
        setIsOpenEditModal(false);
    };
    const hasDoi = viewPaper.identifiers?.doi?.[0] && viewPaper.identifiers?.doi?.[0]?.startsWith('10.');
    const isMetadataDisabled = viewPaper.verified && !isCurationAllowed;

    const paperData = useMemo(
        () => ({
            id: viewPaper.id,
            title: viewPaper.title,
            research_fields: viewPaper.research_fields,
            identifiers: viewPaper.identifiers,
            publication_info: viewPaper.publication_info,
            authors: viewPaper.authors,
            verified: viewPaper.verified,
        }),
        [viewPaper],
    );

    return (
        <>
            {version && (
                <Alert color="warning" className="mt-1 container d-flex">
                    <div className="flex-grow-1">
                        A published version of this paper is available.{' '}
                        <Link href={reverse(ROUTES.VIEW_PAPER, { resourceId: version.id })}>View published version</Link>
                    </div>
                </Alert>
            )}
            <div className="d-flex align-items-start">
                <h2 className={`h4 ${version ? 'mt-1' : 'mt-4'} mb-3 flex-grow-1`}>
                    <PaperTitle title={viewPaper.title} /> <MarkFeatured size="xs" featured={isFeatured} handleChangeStatus={handleChangeStatus} />
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
            {(viewPaper.publication_info?.published_month || viewPaper.publication_info?.published_year) && (
                <span className="badge bg-light me-2">
                    <FontAwesomeIcon icon={faCalendar} />{' '}
                    {viewPaper.publication_info?.published_month
                        ? dayjs()
                              .month(viewPaper.publication_info?.published_month - 1)
                              .format('MMMM')
                        : ''}{' '}
                    {viewPaper.publication_info?.published_year ? viewPaper.publication_info?.published_year : ''}
                </span>
            )}
            {hasDoi && <OpenCitations doi={viewPaper.identifiers?.doi?.[0]} />}
            <ResearchFieldBadge researchField={viewPaper.research_fields?.[0]} />
            <AuthorBadges authors={viewPaper.authors} />
            <br />
            <div className="d-flex justify-content-end align-items-center">
                {viewPaper.publication_info.published_in && viewPaper.publication_info.published_in?.id && (
                    <div className="flex-grow-1">
                        <small>
                            Published in:{' '}
                            <Link
                                style={{ color: '#60687a', fontStyle: 'italic' }}
                                href={reverse(ROUTES.VENUE_PAGE, { venueId: viewPaper.publication_info.published_in?.id })}
                            >
                                {viewPaper.publication_info.published_in?.label}
                            </Link>
                        </small>
                    </div>
                )}
                {hasDoi && (
                    <div className="flex-shrink-0">
                        <small>
                            DOI:{' '}
                            <a href={`https://doi.org/${viewPaper.identifiers?.doi?.[0]}`} target="_blank" rel="noopener noreferrer">
                                https://doi.org/{viewPaper.identifiers?.doi?.[0]}
                            </a>
                        </small>
                    </div>
                )}
            </div>
            <div className="d-flex justify-content-between">
                <div className="d-flex">
                    {props.editMode && (
                        <ConditionalWrapper
                            condition={isMetadataDisabled}
                            wrapper={(children) => (
                                <Tooltip content="The metadata cannot be edited because the correctness is manually verified by a human curator">
                                    {children}
                                </Tooltip>
                            )}
                        >
                            <div>
                                <Button
                                    disabled={isMetadataDisabled}
                                    color="secondary"
                                    size="sm"
                                    className="mt-2 me-2"
                                    onClick={() => setIsOpenEditModal(true)}
                                >
                                    <FontAwesomeIcon icon={faPen} /> Edit metadata
                                </Button>
                            </div>
                        </ConditionalWrapper>
                    )}

                    {showDeleteButton && (
                        <Button color="danger" size="sm" className="mt-2" onClick={deletePapers}>
                            <FontAwesomeIcon icon={faTrash} /> Delete paper
                        </Button>
                    )}
                </div>

                {viewPaper.verified && (
                    <Tooltip content="The paper metadata was verified by an ORKG curator">
                        <div className="mt-3 justify-content-end">
                            <FontAwesomeIcon icon={faCheckCircle} className="mt-1 me-1 text-success" />
                            Verified
                        </div>
                    </Tooltip>
                )}
            </div>
            {isOpenEditModal && (
                <EditPaperModal
                    paperData={paperData}
                    afterUpdate={handleUpdatePaper}
                    isOpen={isOpenEditModal}
                    toggle={(v) => setIsOpenEditModal(!v)}
                />
            )}
        </>
    );
};

PaperHeader.propTypes = {
    editMode: PropTypes.bool.isRequired,
};

export default PaperHeader;
