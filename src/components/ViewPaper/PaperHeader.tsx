import { faCalendar, faCheckCircle, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { FC, ReactNode, useMemo, useState } from 'react';
import useSWR from 'swr';

import AuthorBadges from '@/components/Badges/AuthorBadges/AuthorBadges';
import ResearchFieldBadge from '@/components/Badges/ResearchFieldBadge/ResearchFieldBadge';
import Tooltip from '@/components/FloatingUI/Tooltip';
import useAuthentication from '@/components/hooks/useAuthentication';
import useMarkFeaturedUnlisted from '@/components/MarkFeaturedUnlisted/hooks/useMarkFeaturedUnlisted';
import MarkFeatured from '@/components/MarkFeaturedUnlisted/MarkFeatured/MarkFeatured';
import MarkUnlisted from '@/components/MarkFeaturedUnlisted/MarkUnlisted/MarkUnlisted';
import EditPaperModal from '@/components/PaperForm/EditPaperModal';
import PaperTitle from '@/components/PaperTitle/PaperTitle';
import Alert from '@/components/Ui/Alert/Alert';
import Button from '@/components/Ui/Button/Button';
import useParams from '@/components/useParams/useParams';
import ConditionalWrapper from '@/components/Utils/ConditionalWrapper';
import useDeletePapers from '@/components/ViewPaper/hooks/useDeletePapers';
import useViewPaper from '@/components/ViewPaper/hooks/useViewPaper';
import OpenCitations from '@/components/ViewPaper/OpenCitations/OpenCitations';
import { VISIBILITY } from '@/constants/contentTypes';
import ROUTES from '@/constants/routes';
import { getAltMetrics } from '@/services/altmetric/index';

type PaperHeaderProps = {
    editMode: boolean;
    isPublishedVersionView: boolean;
};

const PaperHeader: FC<PaperHeaderProps> = ({ editMode, isPublishedVersionView = false }) => {
    const [isOpenEditModal, setIsOpenEditModal] = useState(false);
    const { resourceId } = useParams();
    const { paper, version, mutatePaper, originalPaperId } = useViewPaper({ paperId: resourceId });
    const { user, isCurationAllowed } = useAuthentication();
    const userId = user?.id;
    const { deletePapers } = useDeletePapers({ paperIds: paper ? [paper.id] : [], redirect: true });
    const { isFeatured, isUnlisted, handleChangeStatus } = useMarkFeaturedUnlisted({
        resourceId: paper?.id ?? '',
        unlisted: paper?.visibility === VISIBILITY.UNLISTED,
        featured: paper?.visibility === VISIBILITY.FEATURED,
    });
    const { data: altMetrics, isLoading: isAltMetricsLoading } = useSWR(
        paper?.identifiers?.doi?.[0] ? [paper?.identifiers?.doi?.[0], 'getAltMetrics'] : null,
        ([params]) => getAltMetrics(params),
    );

    const paperData = useMemo(
        () => ({
            id: paper?.id,
            title: paper?.title,
            research_fields: paper?.research_fields,
            identifiers: paper?.identifiers,
            publication_info: paper?.publication_info,
            authors: paper?.authors,
            verified: paper?.verified,
        }),
        [paper],
    );

    if (!paper) {
        return null;
    }
    // make sure a user is signed in (not null)
    const userCreatedThisPaper = paper.created_by && userId && paper.created_by === userId;
    const showDeleteButton = editMode && (isCurationAllowed || userCreatedThisPaper);

    const handleUpdatePaper = () => {
        mutatePaper();
        setIsOpenEditModal(false);
    };
    const hasDoi = paper.identifiers?.doi?.[0] && paper.identifiers?.doi?.[0]?.startsWith('10.');
    const isMetadataDisabled = paper.verified && !isCurationAllowed;

    return (
        <>
            {!isPublishedVersionView && version && (
                <Alert color="warning" className="mt-1 container d-flex">
                    <div className="flex-grow-1">
                        A published version of this paper is available.{' '}
                        <Link href={reverse(ROUTES.VIEW_PAPER, { resourceId: version.id })}>View published version</Link>
                    </div>
                </Alert>
            )}
            {isPublishedVersionView && originalPaperId && (
                <Alert color="warning" className="container d-flex">
                    <div className="flex-grow-1">
                        You are viewing the published version of the paper. Click to{' '}
                        <Link href={reverse(ROUTES.VIEW_PAPER, { resourceId: originalPaperId })}>Fetch live data</Link>
                    </div>
                </Alert>
            )}
            <div className="d-flex align-items-start">
                <h2 className={`h4 ${version ? 'mt-1' : 'mt-4'} mb-3 flex-grow-1`}>
                    <PaperTitle title={paper.title} />{' '}
                    {!isPublishedVersionView && (
                        <>
                            <MarkFeatured size="xs" featured={isFeatured} handleChangeStatus={handleChangeStatus} />

                            <div className="d-inline-block ms-1">
                                <MarkUnlisted size="xs" unlisted={isUnlisted} handleChangeStatus={handleChangeStatus} />
                            </div>
                        </>
                    )}
                </h2>
                {!isAltMetricsLoading && altMetrics !== undefined && (
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
            {(paper.publication_info?.published_month || paper.publication_info?.published_year) && (
                <span className="badge bg-light me-2">
                    <FontAwesomeIcon icon={faCalendar} />{' '}
                    {paper.publication_info?.published_month
                        ? dayjs()
                              .month(paper.publication_info?.published_month - 1)
                              .format('MMMM')
                        : ''}{' '}
                    {paper.publication_info?.published_year ? paper.publication_info?.published_year : ''}
                </span>
            )}
            {hasDoi && <OpenCitations doi={paper.identifiers?.doi?.[0]} />}
            <ResearchFieldBadge researchField={paper.research_fields?.[0]} />
            <AuthorBadges authors={paper.authors} />
            <br />
            <div className="d-flex justify-content-end align-items-center">
                {paper.publication_info.published_in && paper.publication_info.published_in?.id && (
                    <div className="flex-grow-1">
                        <small>
                            Published in:{' '}
                            <Link
                                style={{ color: '#60687a', fontStyle: 'italic' }}
                                href={reverse(ROUTES.VENUE_PAGE, { venueId: paper.publication_info.published_in?.id })}
                            >
                                {paper.publication_info.published_in?.label}
                            </Link>
                        </small>
                    </div>
                )}
                {hasDoi && (
                    <div className="flex-shrink-0">
                        <small>
                            DOI:{' '}
                            <a href={`https://doi.org/${paper.identifiers?.doi?.[0]}`} target="_blank" rel="noopener noreferrer">
                                https://doi.org/{paper.identifiers?.doi?.[0]}
                            </a>
                        </small>
                    </div>
                )}
            </div>
            {!isPublishedVersionView && (
                <div className="d-flex justify-content-between">
                    <div className="d-flex">
                        {editMode && (
                            <ConditionalWrapper
                                condition={isMetadataDisabled}
                                wrapper={(children: ReactNode) => (
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

                    {paper.verified && (
                        <Tooltip content="The paper metadata was verified by an ORKG curator">
                            <div className="mt-3 justify-content-end">
                                <FontAwesomeIcon icon={faCheckCircle} className="mt-1 me-1 text-success" />
                                Verified
                            </div>
                        </Tooltip>
                    )}
                </div>
            )}
            {!isPublishedVersionView && isOpenEditModal && (
                <EditPaperModal
                    paperData={paperData}
                    // @ts-expect-error TODO: waiting for the conversion to TS
                    afterUpdate={handleUpdatePaper}
                    isOpen={isOpenEditModal}
                    // @ts-expect-error TODO: waiting for the conversion to TS
                    toggle={(v) => setIsOpenEditModal(!v)}
                />
            )}
        </>
    );
};

export default PaperHeader;
