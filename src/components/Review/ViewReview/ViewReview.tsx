import { faLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Button } from '@heroui/react';
import Link from 'next/link';
import { env } from 'next-runtime-env';
import { FC } from 'react';

import { SectionStyled } from '@/components/ArticleBuilder/styled';
import AuthorBadges from '@/components/Badges/AuthorBadges/AuthorBadges';
import PublishedBadge from '@/components/Badges/PublishedBadge/PublishedBadge';
import ResearchFieldBadge from '@/components/Badges/ResearchFieldBadge/ResearchFieldBadge';
import Tooltip from '@/components/FloatingUI/Tooltip';
import useMarkFeaturedUnlisted from '@/components/MarkFeaturedUnlisted/hooks/useMarkFeaturedUnlisted';
import MarkFeatured from '@/components/MarkFeaturedUnlisted/MarkFeatured/MarkFeatured';
import MarkUnlisted from '@/components/MarkFeaturedUnlisted/MarkUnlisted/MarkUnlisted';
import useReview from '@/components/Review/hooks/useReview';
import Outline from '@/components/Review/Outline/Outline';
import SectionAcknowledgements from '@/components/Review/Sections/Acknowledgements/SectionAcknowledgements/SectionAcknowledgements';
import SectionComparison from '@/components/Review/Sections/Comparison/SectionComparison';
import SectionDataTable from '@/components/Review/Sections/Ontology/SectionOntology';
import SectionReferences from '@/components/Review/Sections/References/SectionReferences/SectionReferences';
import SectionResourceProperty from '@/components/Review/Sections/ResourceProperty/SectionResourceProperty';
import TextSection from '@/components/Review/Sections/Text/TextSection';
import SectionVisualization from '@/components/Review/Sections/Visualization/SectionVisualization';
import SustainableDevelopmentGoals from '@/components/Review/SustainableDevelopmentGoals/SustainableDevelopmentGoals';
import useParams from '@/components/useParams/useParams';
import { VISIBILITY } from '@/constants/contentTypes';
import { ENTITIES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { getLinkByEntityType } from '@/utils';

type ViewReviewProps = {
    setIsOpenHistoryModal: (isOpen: boolean) => void;
};

const ViewReview: FC<ViewReviewProps> = ({ setIsOpenHistoryModal }) => {
    const { review } = useReview();
    const { id } = useParams();
    const latestVersionId = review?.versions?.published?.[0]?.id;
    const newVersionAvailable = review?.published && latestVersionId !== id;
    const url = env('NEXT_PUBLIC_URL') + reverse(ROUTES.REVIEW, { id });

    const { isFeatured, isUnlisted, handleChangeStatus } = useMarkFeaturedUnlisted({
        resourceId: id,
        unlisted: review?.visibility === VISIBILITY.UNLISTED,
        featured: review?.visibility === VISIBILITY.FEATURED,
    });

    if (!review) {
        return null;
    }

    return (
        <div className="print-only relative mx-auto flex max-w-container flex-col gap-y-4 px-3">
            <Outline />
            {!review.published && (
                <Alert status="warning" className="shadow">
                    <Alert.Indicator />
                    <Alert.Content>
                        <Alert.Title>Unpublished version</Alert.Title>
                        <Alert.Description>
                            You are viewing an unpublished version of this article. The content can be changed by anyone.{' '}
                            <Button variant="primary" size="sm" onPress={() => setIsOpenHistoryModal(true)}>
                                View publish history
                            </Button>
                        </Alert.Description>
                    </Alert.Content>
                </Alert>
            )}
            {newVersionAvailable && (
                <Alert status="warning" className="shadow">
                    <Alert.Indicator />
                    <Alert.Content>
                        <Alert.Title>Newer version available</Alert.Title>
                        <Alert.Description>
                            A newer version of this article is available.{' '}
                            <Link href={reverse(ROUTES.REVIEW, { id: latestVersionId })}>View latest version</Link> or{' '}
                            <Link href={reverse(ROUTES.REVIEW_DIFF, { oldId: id, newId: latestVersionId })}>compare to latest version</Link>.
                        </Alert.Description>
                    </Alert.Content>
                </Alert>
            )}
            <div>
                <article>
                    <SectionStyled className="box rounded">
                        <header>
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="flex mb-2 mt-6">
                                        <h1 className="whitespace-pre-line" typeof="doco:Title" property="c4o:hasContent">
                                            {review.title}{' '}
                                        </h1>
                                        {review.published && (
                                            <h2 className="text-2xl ml-2 mt-2 d-print-none">
                                                <MarkFeatured size="xs" featured={isFeatured} handleChangeStatus={handleChangeStatus} />
                                                <div className="inline-block ml-1">
                                                    <MarkUnlisted size="xs" unlisted={isUnlisted} handleChangeStatus={handleChangeStatus} />
                                                </div>
                                            </h2>
                                        )}
                                    </div>
                                </div>
                                <SustainableDevelopmentGoals />
                            </div>
                            <div className="my-4">
                                <Alert status="accent" className="hidden d-print-block">
                                    <Alert.Indicator />
                                    <Alert.Content>
                                        <Alert.Title>Read on ORKG</Alert.Title>
                                        <Alert.Description>
                                            Read the full and interactive version of this article on the ORKG website: <Link href={url}>{url}</Link>
                                        </Alert.Description>
                                    </Alert.Content>
                                </Alert>
                                {review.published && <PublishedBadge />}
                                <ResearchFieldBadge researchField={review.research_fields?.[0]} />
                                <AuthorBadges authors={review.authors} />{' '}
                                {review.identifiers.doi?.[0] && (
                                    <div className="mb-1">
                                        <small>
                                            DOI:{' '}
                                            <a href={`https://doi.org/${review.identifiers.doi[0]}`} target="_blank" rel="noopener noreferrer">
                                                https://doi.org/{review.identifiers.doi[0]}
                                            </a>
                                        </small>
                                    </div>
                                )}
                            </div>
                        </header>
                        {review.sections.map((section) => (
                            <section
                                key={section.id}
                                typeof={section.type === 'text' ? `doco:Section deo:${section?.type}` : 'doco:Section'}
                                property="c4o:hasContent"
                            >
                                <h2
                                    id={`section-${section.id}`}
                                    className="text-2xl border-b mt-12 whitespace-pre-line"
                                    typeof="doco:SectionTitle"
                                    property="c4o:hasContent"
                                >
                                    {section.heading}{' '}
                                    {section.type === 'comparison' && (
                                        <Tooltip content="Go to comparison page">
                                            <Link
                                                target="_blank"
                                                className="ml-2"
                                                href={reverse(ROUTES.COMPARISON, {
                                                    comparisonId: section.comparison?.id,
                                                })}
                                            >
                                                <FontAwesomeIcon icon={faLink} size="xs" />
                                            </Link>
                                        </Tooltip>
                                    )}
                                    {(section.type === 'resource' || section.type === 'property') && (
                                        <Tooltip content={`Go to ${section.type} page`}>
                                            <Link
                                                target="_blank"
                                                className="ml-2"
                                                href={getLinkByEntityType(
                                                    section.type === 'property' ? ENTITIES.PREDICATE : ENTITIES.RESOURCE,
                                                    (section.type === 'property' ? section.predicate?.id : section.resource?.id) || '',
                                                )}
                                            >
                                                <FontAwesomeIcon icon={faLink} size="xs" />
                                            </Link>
                                        </Tooltip>
                                    )}
                                </h2>
                                {section.type === 'ontology' && <SectionDataTable key={section.id} section={section} />}

                                {(section.type === 'resource' || section.type === 'property') && <SectionResourceProperty section={section} />}

                                {section.type === 'comparison' && <SectionComparison key={section.id} section={section} />}

                                {section.type === 'visualization' && (
                                    <SectionVisualization key={section.id} id={section.visualization?.id} label={section.visualization?.label} />
                                )}
                                {section.type === 'text' && <TextSection text={section.text ?? ''} sectionId={section.id} />}
                            </section>
                        ))}
                        <SectionAcknowledgements />

                        <SectionReferences />
                    </SectionStyled>
                </article>
            </div>
        </div>
    );
};

export default ViewReview;
