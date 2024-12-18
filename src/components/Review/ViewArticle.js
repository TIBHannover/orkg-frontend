import { faLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import { SectionStyled } from 'components/ArticleBuilder/styled';
import AuthorBadges from 'components/Badges/AuthorBadges/AuthorBadges';
import ResearchFieldBadge from 'components/Badges/ResearchFieldBadge/ResearchFieldBadge';
import DataBrowser from 'components/DataBrowser/DataBrowser';
import MarkFeatured from 'components/MarkFeaturedUnlisted/MarkFeatured/MarkFeatured';
import MarkUnlisted from 'components/MarkFeaturedUnlisted/MarkUnlisted/MarkUnlisted';
import useMarkFeaturedUnlisted from 'components/MarkFeaturedUnlisted/hooks/useMarkFeaturedUnlisted';
import Link from 'next/link';
import { env } from 'next-runtime-env';
import useParams from 'components/useParams/useParams';
import Acknowledgements from 'components/Review/Acknowledgements';
import SectionDataTable from 'components/Review/DataTable/SectionOntology';
import MarkdownRenderer from 'components/Review/MarkdownRenderer';
import Outline from 'components/Review/Outline';
import ListReferences from 'components/Review/References/ListReferences';
import SectionComparison from 'components/Review/SectionComparison';
import SectionVisualization from 'components/Review/SectionVisualization';
import SustainableDevelopmentGoals from 'components/Review/SustainableDevelopmentGoals';
import ViewArticleStatementBrowser from 'components/Review/ViewArticleStatementBrowser';
import { CLASSES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Button, Container } from 'reactstrap';
import { toggleHistoryModal as toggleHistoryModalAction } from 'slices/reviewSlice';
import { convertAuthorsToNewFormat } from 'utils';

const ViewArticle = () => {
    const { id } = useParams();
    const paper = useSelector((state) => state.review.paper);
    const articleResource = useSelector((state) => state.review.articleResource);
    const authors = useSelector((state) => state.review.authorResources);
    const sections = useSelector((state) => state.review.sections);
    const isPublished = useSelector((state) => state.review.isPublished);
    const versions = useSelector((state) => state.review.versions);
    const researchField = useSelector((state) => state.review.researchField);
    const doi = useSelector((state) => state.review.doi);
    const dispatch = useDispatch();
    const latestVersionId = versions?.[0]?.id;
    const newVersionAvailable = isPublished && latestVersionId !== id;
    const toggleHistoryModal = () => dispatch(toggleHistoryModalAction());
    const url = env('NEXT_PUBLIC_URL') + reverse(ROUTES.REVIEW, { id });

    const { isFeatured, isUnlisted, handleChangeStatus } = useMarkFeaturedUnlisted({
        resourceId: id,
        unlisted: articleResource?.unlisted,
        featured: articleResource?.featured,
    });

    return (
        <Container className="print-only p-0" style={{ position: 'relative' }}>
            <Outline />
            {!isPublished && (
                <Alert color="warning" fade={false} className="box-shadow">
                    Warning: you are viewing an unpublished version of this article. The content can be changed by anyone.{' '}
                    <Button color="link" className="p-0" onClick={toggleHistoryModal}>
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
                                            {paper.title}{' '}
                                        </h1>
                                        {isPublished && (
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
                                <ResearchFieldBadge researchField={researchField} />
                                <AuthorBadges authors={convertAuthorsToNewFormat(authors)} />{' '}
                                {doi && (
                                    <div className="mb-1">
                                        <small>
                                            DOI:{' '}
                                            <a href={`https://doi.org/${doi}`} target="_blank" rel="noopener noreferrer">
                                                https://doi.org/{doi}
                                            </a>
                                        </small>
                                    </div>
                                )}
                            </div>
                        </header>
                        {sections.map((section) => {
                            if (
                                [
                                    CLASSES.RESOURCE_SECTION,
                                    CLASSES.PROPERTY_SECTION,
                                    CLASSES.COMPARISON_SECTION,
                                    CLASSES.VISUALIZATION_SECTION,
                                    CLASSES.ONTOLOGY_SECTION,
                                ].includes(section.type.id)
                            ) {
                                return (
                                    <section key={section.id} typeof="doco:Section">
                                        <h2
                                            id={`section-${section.id}`}
                                            className="h4 border-bottom mt-5"
                                            typeof="doco:SectionTitle"
                                            property="c4o:hasContent"
                                        >
                                            {section.title.label}{' '}
                                            {section.type.id === CLASSES.COMPARISON_SECTION && (
                                                <Tippy content="Go to comparison page">
                                                    <Link
                                                        target="_blank"
                                                        className="ms-2"
                                                        href={reverse(ROUTES.COMPARISON, {
                                                            comparisonId: section.contentLink.objectId,
                                                        })}
                                                    >
                                                        <FontAwesomeIcon icon={faLink} size="xs" />
                                                    </Link>
                                                </Tippy>
                                            )}
                                        </h2>
                                        {section.type.id === CLASSES.ONTOLOGY_SECTION && <SectionDataTable key={section.id} section={section} />}
                                        {section?.contentLink?.objectId && (
                                            <>
                                                {section.type.id !== CLASSES.COMPARISON_SECTION &&
                                                    section.type.id !== CLASSES.VISUALIZATION_SECTION && (
                                                        <>
                                                            <div className="mt-3 mb-2">
                                                                <Link
                                                                    href={
                                                                        section.type.id === CLASSES.RESOURCE_SECTION
                                                                            ? `${reverse(ROUTES.RESOURCE, {
                                                                                  id: section.contentLink.objectId,
                                                                              })}?noRedirect`
                                                                            : reverse(ROUTES.PREDICATE, {
                                                                                  id: section.contentLink.objectId,
                                                                              })
                                                                    }
                                                                    target="_blank"
                                                                >
                                                                    {section.contentLink.label}
                                                                </Link>
                                                            </div>
                                                            {!isPublished ? (
                                                                <DataBrowser id={section.contentLink.objectId} showHeader={false} />
                                                            ) : (
                                                                <ViewArticleStatementBrowser id={section.contentLink.objectId} />
                                                            )}
                                                        </>
                                                    )}
                                                {section.type.id === CLASSES.COMPARISON_SECTION && (
                                                    <SectionComparison key={section.id} id={section.contentLink.objectId} sectionId={section.id} />
                                                )}
                                                {section.type.id === CLASSES.VISUALIZATION_SECTION && (
                                                    <SectionVisualization key={section.id} id={section.contentLink.objectId} />
                                                )}
                                            </>
                                        )}
                                    </section>
                                );
                            }
                            return (
                                <section key={section.id} typeof={`doco:Section deo:${section?.type?.id}`} property="c4o:hasContent">
                                    <h2
                                        className="h4 border-bottom mt-4"
                                        style={{ whiteSpace: 'pre-line' }}
                                        typeof="doco:SectionTitle"
                                        property="c4o:hasContent"
                                        id={`section-${section.id}`}
                                    >
                                        {section.title.label}
                                    </h2>
                                    <MarkdownRenderer text={section.markdown.label} id={section.markdown.id} />
                                </section>
                            );
                        })}
                        <section typeof="doco:Section deo:Acknowledgements">
                            <h2 id="section-acknowledgements" className="h4 border-bottom mt-5" typeof="doco:SectionTitle" property="c4o:hasContent">
                                <Tippy content="Acknowledgements are automatically generated based on ORKG users that contributed to resources used in this article">
                                    <span>Acknowledgements</span>
                                </Tippy>
                            </h2>
                            <Acknowledgements />
                        </section>

                        <section typeof="doco:Section deo:Reference">
                            <h2 id="section-references" className="h4 border-bottom mt-4" typeof="doco:SectionTitle" property="c4o:hasContent">
                                References
                            </h2>
                            <ListReferences />
                        </section>
                    </SectionStyled>
                </article>
            </main>
        </Container>
    );
};

export default ViewArticle;
