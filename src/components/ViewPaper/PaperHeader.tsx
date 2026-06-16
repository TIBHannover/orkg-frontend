import { faCalendar, faCheckCircle, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Button, Chip } from '@heroui/react';
import { buttonVariants } from '@heroui/styles';
import dayjs from 'dayjs';
import Link from 'next/link';
import { FC, ReactNode, useState } from 'react';
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
import Container from '@/components/Ui/Structure/Container';
import useParams from '@/components/useParams/useParams';
import ConditionalWrapper from '@/components/Utils/ConditionalWrapper';
import useDeletePapers from '@/components/ViewPaper/hooks/useDeletePapers';
import useViewPaper from '@/components/ViewPaper/hooks/useViewPaper';
import OpenCitations from '@/components/ViewPaper/OpenCitations/OpenCitations';
import { VISIBILITY } from '@/constants/contentTypes';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
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

    if (!paper) {
        return null;
    }
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
            <div className="flex flex-col gap-3">
                {!isPublishedVersionView && version && (
                    <Container className="w-full px-0">
                        <Alert status="warning">
                            <Alert.Indicator />
                            <Alert.Content>
                                <Alert.Title>Published version available</Alert.Title>
                                <Alert.Description>
                                    A published version of this paper is available. You are currently viewing the live data.{' '}
                                    <Link
                                        className={`${buttonVariants({ size: 'sm' })} hover:no-underline`}
                                        href={reverse(ROUTES.VIEW_PAPER, { resourceId: version.id })}
                                    >
                                        View published version
                                    </Link>
                                </Alert.Description>
                            </Alert.Content>
                        </Alert>
                    </Container>
                )}
                {isPublishedVersionView && originalPaperId && (
                    <Container className="w-full px-0">
                        <Alert status="warning">
                            <Alert.Indicator />
                            <Alert.Content>
                                <Alert.Title>Viewing published paper</Alert.Title>
                                <Alert.Description>
                                    This is a published snapshot of the paper.{' '}
                                    <Link
                                        className={`${buttonVariants({ size: 'sm' })} hover:no-underline`}
                                        href={reverse(ROUTES.VIEW_PAPER, { resourceId: originalPaperId })}
                                    >
                                        Fetch live data
                                    </Link>
                                </Alert.Description>
                            </Alert.Content>
                        </Alert>
                    </Container>
                )}
                <div className="flex items-start gap-2">
                    <h2 className="text-2xl grow mb-0">
                        <PaperTitle title={paper.title} />{' '}
                        {!isPublishedVersionView && (
                            <>
                                <MarkFeatured size="xs" featured={isFeatured} handleChangeStatus={handleChangeStatus} />

                                <span className="inline-block ml-1">
                                    <MarkUnlisted size="xs" unlisted={isUnlisted} handleChangeStatus={handleChangeStatus} />
                                </span>
                            </>
                        )}
                    </h2>
                    {!isAltMetricsLoading && altMetrics !== undefined && (
                        <div className="shrink-0">
                            <small>
                                <a href={altMetrics.details_url} target="_blank" rel="noopener noreferrer">
                                    <img src={altMetrics.images.small} height="60px" alt="Alt metrics icon" />
                                </a>
                            </small>
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap items-center -mb-2">
                    {(paper.publication_info?.published_month || paper.publication_info?.published_year) && (
                        <Chip color="default" className="mr-2 mb-2">
                            <FontAwesomeIcon icon={faCalendar} className="mr-1" />
                            {paper.publication_info?.published_month
                                ? dayjs()
                                      .month(paper.publication_info?.published_month - 1)
                                      .format('MMMM')
                                : ''}{' '}
                            {paper.publication_info?.published_year ? paper.publication_info?.published_year : ''}
                        </Chip>
                    )}
                    {hasDoi && <OpenCitations doi={paper.identifiers?.doi?.[0]} />}
                    <ResearchFieldBadge researchField={paper.research_fields?.[0]} />
                    <AuthorBadges authors={paper.authors} />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4">
                    {paper.publication_info.published_in && paper.publication_info.published_in?.id && (
                        <div className="grow">
                            <small>
                                Published in:{' '}
                                <Link href={reverse(ROUTES.VENUE_PAGE, { venueId: paper.publication_info.published_in?.id })}>
                                    {paper.publication_info.published_in?.label}
                                </Link>
                            </small>
                        </div>
                    )}
                    {hasDoi && (
                        <div className="shrink-0">
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
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex gap-2">
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
                                            isDisabled={isMetadataDisabled}
                                            className="button--orkg-secondary"
                                            size="sm"
                                            onPress={() => setIsOpenEditModal(true)}
                                        >
                                            <FontAwesomeIcon icon={faPen} /> Edit metadata
                                        </Button>
                                    </div>
                                </ConditionalWrapper>
                            )}

                            {showDeleteButton && (
                                <Button variant="danger" size="sm" onPress={deletePapers}>
                                    <FontAwesomeIcon icon={faTrash} /> Delete paper
                                </Button>
                            )}
                        </div>

                        {paper.verified && (
                            <Tooltip content="The paper metadata was verified by an ORKG curator">
                                <div className="flex items-center gap-1">
                                    <FontAwesomeIcon icon={faCheckCircle} className="text-success" />
                                    Verified
                                </div>
                            </Tooltip>
                        )}
                    </div>
                )}
            </div>
            {!isPublishedVersionView && isOpenEditModal && (
                <EditPaperModal paperData={paper ?? null} afterUpdate={handleUpdatePaper} toggle={() => setIsOpenEditModal(false)} />
            )}
        </>
    );
};

export default PaperHeader;
