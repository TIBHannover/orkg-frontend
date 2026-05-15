import { faCalendar, faPen, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Chip } from '@heroui/react';
import dayjs from 'dayjs';
import { FC, useState } from 'react';

import EditMetadataModal from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonHeader/EditMetadataModal/EditMetadataModel';
import ObservatoryBox from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonMetaData/ObservatoryBox/ObservatoryBox';
import AuthorBadges from '@/components/Badges/AuthorBadges/AuthorBadges';
import PublishedBadge from '@/components/Badges/PublishedBadge/PublishedBadge';
import ResearchFieldBadge from '@/components/Badges/ResearchFieldBadge/ResearchFieldBadge';
import useComparison from '@/components/Comparison/hooks/useComparison';
import Tooltip from '@/components/FloatingUI/Tooltip';
import MarkFeaturedUnlistedContainer from '@/components/MarkFeaturedUnlisted/MarkFeaturedUnlistedContainer/MarkFeaturedUnlistedContainer';
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
            {comparison.id && (
                <div className="py-6 md:py-8" style={{ minHeight: 150 }}>
                    <div className="flex flex-col md:flex-row md:items-start gap-6">
                        <div className="grow min-w-0">
                            {(comparison.title || comparison.id) && (
                                <>
                                    <h2 className="text-2xl mb-3 flex flex-wrap items-center gap-2">
                                        <span>{comparison.title}</span>
                                        {comparison.id && (
                                            <MarkFeaturedUnlistedContainer
                                                size="xs"
                                                id={comparison.id}
                                                featured={comparison.visibility === VISIBILITY.FEATURED}
                                                unlisted={comparison.visibility === VISIBILITY.UNLISTED}
                                            />
                                        )}
                                    </h2>
                                    <div className="mb-2">
                                        {isPublished && comparison.created_at && (
                                            <Chip color="default" className="mr-2 mb-2">
                                                <FontAwesomeIcon icon={faCalendar} /> {dayjs(comparison.created_at).format('MMMM')}{' '}
                                                {dayjs(comparison.created_at).format('YYYY')}
                                            </Chip>
                                        )}
                                        {isPublished && <PublishedBadge />}
                                        {comparison.research_fields?.[0] && <ResearchFieldBadge researchField={comparison.research_fields?.[0]} />}
                                        {comparison.authors?.length > 0 && !isAnonymized && <AuthorBadges authors={comparison.authors} />}
                                        {isAnonymized && (
                                            <Tooltip content="The authors are hidden because the comparison is anonymized">
                                                <span>
                                                    <Chip color="default" className="mr-2 mb-2" typeof="foaf:Person">
                                                        <FontAwesomeIcon icon={faUser} aria-label="Author name" /> Anonymized
                                                    </Chip>
                                                </span>
                                            </Tooltip>
                                        )}
                                    </div>
                                    {comparison.description && (
                                        <div className="text-base leading-relaxed mb-3 whitespace-pre-wrap text-default-700">
                                            <LinkValuePlugins text={comparison.description} />
                                        </div>
                                    )}
                                    {comparison.identifiers?.doi?.[0] && (
                                        <div className="text-sm text-default-500 mb-1 leading-6">
                                            DOI:{' '}
                                            <a
                                                href={`https://doi.org/${comparison.identifiers?.doi?.[0]}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="break-all"
                                            >
                                                https://doi.org/{comparison.identifiers?.doi?.[0]}
                                            </a>
                                        </div>
                                    )}
                                </>
                            )}
                            {isEditMode && (
                                <Button variant="secondary" size="sm" className="mt-3" onPress={() => setIsOpenEditModal(true)}>
                                    <FontAwesomeIcon icon={faPen} className="mr-1" /> Edit metadata
                                </Button>
                            )}
                        </div>

                        <div className="flex flex-col items-start md:items-end gap-2 mt-2 md:border-l md:border-default md:pl-4 w-full md:w-auto shrink-0">
                            {!isAnonymized && comparison.created_by !== MISC.UNKNOWN_ID && (
                                <Chip color="default">
                                    <FontAwesomeIcon icon={faUser} /> Created by{' '}
                                    <span className="ml-1 inline-block md:-my-8">
                                        <UserAvatar size={20} userId={comparison.created_by} showDisplayName />
                                    </span>
                                </Chip>
                            )}

                            <ObservatoryBox />

                            <SdgBox
                                sdgs={comparison.sdgs}
                                maxWidth="100%"
                                handleSave={(sdgs) => updateComparison({ sdgs })}
                                isEditable={isEditMode}
                            />
                        </div>
                    </div>
                </div>
            )}
            {isOpenEditModal && <EditMetadataModal toggle={() => setIsOpenEditModal((v) => !v)} comparisonId={comparisonId} />}
        </>
    );
};

export default ComparisonMetaData;
