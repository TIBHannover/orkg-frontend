import { faLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SectionStyled } from 'components/ArticleBuilder/styled';
import AuthorBadges from 'components/Badges/AuthorBadges/AuthorBadges';
import ResearchFieldBadge from 'components/Badges/ResearchFieldBadge/ResearchFieldBadge';
import Tooltip from 'components/FloatingUI/Tooltip';
import MarkFeatured from 'components/MarkFeaturedUnlisted/MarkFeatured/MarkFeatured';
import MarkUnlisted from 'components/MarkFeaturedUnlisted/MarkUnlisted/MarkUnlisted';
import useMarkFeaturedUnlisted from 'components/MarkFeaturedUnlisted/hooks/useMarkFeaturedUnlisted';
import Outline from 'components/Review/Outline/Outline';
import SectionAcknowledgements from 'components/Review/Sections/Acknowledgements/SectionAcknowledgements/SectionAcknowledgements';
import SectionComparison from 'components/Review/Sections/Comparison/SectionComparison';
import SectionDataTable from 'components/Review/Sections/Ontology/SectionOntology';
import SectionReferences from 'components/Review/Sections/References/SectionReferences/SectionReferences';
import SectionResourceProperty from 'components/Review/Sections/ResourceProperty/SectionResourceProperty';
import TextSection from 'components/Review/Sections/Text/TextSection';
import SectionVisualization from 'components/Review/Sections/Visualization/SectionVisualization';
import SustainableDevelopmentGoals from 'components/Review/SustainableDevelopmentGoals/SustainableDevelopmentGoals';
import useReview from 'components/Review/hooks/useReview';
import useParams from 'components/useParams/useParams';
import { VISIBILITY } from 'constants/contentTypes';
import { ENTITIES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { env } from 'next-runtime-env';
import Link from 'next/link';
import { FC } from 'react';
import { Alert, Button, Container } from 'reactstrap';
import { getLinkByEntityType } from 'utils';

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
        <Container className="print-only p-0" style={{ position: 'relative' }}>
            <Outline />
            {!review.published && (
                <Alert color="warning" fade={false} className="box-shadow">
                    Warning: you are viewing an unpublished version of this article. The content can be changed by anyone.{' '}
                    <Button color="link" className="p-0" onClick={() => setIsOpenHistoryModal(true)}>
                        View publish history
                    </Button>
                </Alert>
            )}
            {newVersionAvailable && (
                <Alert color="warning" fade={false} className="box-shadow">
                    Warning: a newer version of this article is available.{' '}
                    <Link href={reverse(ROUTES.REVIEW, { id: latestVersionId })}>View latest version</Link> or{' '}
                    <Link href={reverse(ROUTES.REVIEW_DIFF, { oldId: id, newId: latestVersionId })}>compare to latest version</Link>.
                </Alert>
            )}
            <main>
                <article>
                    <SectionStyled className="box rounded">
                        <header>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <div className="d-flex mb-2 mt-4">
                                        <h1 style={{ whiteSpace: 'pre-line' }} typeof="doco:Title" property="c4o:hasContent">
                                            {review.title}{' '}
                                        </h1>
                                        {review.published && (
                                            <h2 className="h4 ms-2 mt-2 d-print-none">
                                                <MarkFeatured size="xs" featured={isFeatured} handleChangeStatus={handleChangeStatus} />
                                                <div className="d-inline-block ms-1">
                                                    <MarkUnlisted size="xs" unlisted={isUnlisted} handleChangeStatus={handleChangeStatus} />
                                                </div>
                                            </h2>
                                        )}
                                    </div>
                                </div>
                                <SustainableDevelopmentGoals />
                            </div>
                            <div className="my-3">
                                <Alert color="info" fade={false} className="d-none d-print-block">
                                    Read the full and interactive version of this article on the ORKG website: <Link href={url}>{url}</Link>
                                </Alert>
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
                                    className="h4 border-bottom mt-5"
                                    typeof="doco:SectionTitle"
                                    property="c4o:hasContent"
                                    style={{ whiteSpace: 'pre-line' }}
                                >
                                    {section.heading}{' '}
                                    {section.type === 'comparison' && (
                                        <Tooltip content="Go to comparison page">
                                            <Link
                                                target="_blank"
                                                className="ms-2"
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
                                                className="ms-2"
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
            </main>
        </Container>
    );
};

export default ViewReview;
