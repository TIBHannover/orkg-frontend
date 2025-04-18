import { faCalendar, faPen, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import { FC, useState } from 'react';
import { Badge, Button } from 'reactstrap';

import AuthorBadges from '@/components/Badges/AuthorBadges/AuthorBadges';
import ResearchFieldBadge from '@/components/Badges/ResearchFieldBadge/ResearchFieldBadge';
import EditMetadataModal from '@/components/Comparison/ComparisonHeader/EditMetadataModal/EditMetadataModel';
import MarkFeaturedUnlistedContainer from '@/components/Comparison/ComparisonHeader/MarkFeaturedUnlistedContainer';
import useComparison from '@/components/Comparison/hooks/useComparison';
import ObservatoryBox from '@/components/Comparison/ObservatoryBox/ObservatoryBox';
import Tooltip from '@/components/FloatingUI/Tooltip';
import ShareLinkMarker from '@/components/ShareLinkMarker/ShareLinkMarker';
import SdgBox from '@/components/SustainableDevelopmentGoals/SdgBox';
import UserAvatar from '@/components/UserAvatar/UserAvatar';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import LinkValuePlugins from '@/components/ValuePlugins/Link/Link';
import { VISIBILITY } from '@/constants/contentTypes';
import { MISC } from '@/constants/graphSettings';

const ComparisonMetaData: FC<{ comparisonId: string }> = ({ comparisonId }) => {
    const { comparison, isPublished, updateComparison, isAnonymized } = useComparison(comparisonId);
    const { isEditMode } = useIsEditMode();
    const [isOpenEditModal, setIsOpenEditModal] = useState(false);

    if (!comparison) {
        return null;
    }

    return (
        <>
            {comparison.id && <ShareLinkMarker typeOfLink="comparison" title={comparison.title} />}
            {comparison.id && (
                <div className="pt-2 pb-3" style={{ minHeight: 150 }}>
                    <div className="p-0 d-flex align-items-start">
                        <div className="flex-grow-1">
                            {(comparison.title || comparison.id) && (
                                <>
                                    <h4 className="mb-2 mt-4">
                                        {comparison.title}{' '}
                                        {comparison.id && (
                                            <MarkFeaturedUnlistedContainer
                                                size="xs"
                                                id={comparison.id}
                                                featured={comparison.visibility === VISIBILITY.FEATURED}
                                                unlisted={comparison.visibility === VISIBILITY.UNLISTED}
                                            />
                                        )}
                                    </h4>
                                    <div>
                                        <div>
                                            {isPublished && comparison.created_at && (
                                                <Badge color="light" className="me-2 mb-2">
                                                    <FontAwesomeIcon icon={faCalendar} /> {dayjs(comparison.created_at).format('MMMM')}{' '}
                                                    {dayjs(comparison.created_at).format('YYYY')}
                                                </Badge>
                                            )}
                                            {comparison.research_fields?.[0] && (
                                                <ResearchFieldBadge researchField={comparison.research_fields?.[0]} />
                                            )}
                                            {comparison.authors?.length > 0 && !isAnonymized && <AuthorBadges authors={comparison.authors} />}
                                            {isAnonymized && (
                                                <Tooltip content="The authors are hidden because the comparison is anonymized">
                                                    <span>
                                                        <Badge color="light" className="me-2 mb-2" typeof="foaf:Person">
                                                            <FontAwesomeIcon icon={faUser} aria-label="Author name" /> Anonymized
                                                        </Badge>
                                                    </span>
                                                </Tooltip>
                                            )}
                                        </div>
                                        {comparison.description && (
                                            <div style={{ lineHeight: 1.5, whiteSpace: 'pre-wrap' }} className="h6 mb-2">
                                                <LinkValuePlugins text={comparison.description} />
                                            </div>
                                        )}
                                        {comparison.identifiers?.doi?.[0] && (
                                            <div className="mb-1" style={{ lineHeight: 1.5 }}>
                                                <small>
                                                    DOI:{' '}
                                                    <a
                                                        href={`https://doi.org/${comparison.identifiers?.doi?.[0]}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        https://doi.org/{comparison.identifiers?.doi?.[0]}
                                                    </a>
                                                </small>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                            {isEditMode && (
                                <Button color="secondary" size="sm" className="mt-2 me-2" onClick={() => setIsOpenEditModal(true)}>
                                    <FontAwesomeIcon icon={faPen} /> Edit metadata
                                </Button>
                            )}
                        </div>

                        <div className="d-flex flex-column align-items-end gap-2 mt-2 border-start border-light ps-4">
                            {!isAnonymized && comparison.created_by !== MISC.UNKNOWN_ID && (
                                <div style={{ marginRight: -25 }}>
                                    <Badge color="light">
                                        <FontAwesomeIcon icon={faUser} /> Created by{' '}
                                        <span className="ms-1 d-inline-block" style={{ marginTop: -30, marginBottom: -30 }}>
                                            <UserAvatar size={20} userId={comparison.created_by} showDisplayName />
                                        </span>
                                    </Badge>
                                </div>
                            )}

                            <ObservatoryBox />

                            <div style={{ marginRight: -25 }}>
                                <SdgBox
                                    sdgs={comparison.sdgs}
                                    maxWidth="100%"
                                    handleSave={(sdgs) => updateComparison({ sdgs })}
                                    isEditable={isEditMode}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {isOpenEditModal && <EditMetadataModal toggle={() => setIsOpenEditModal((v) => !v)} comparisonId={comparisonId} />}
        </>
    );
};

export default ComparisonMetaData;
