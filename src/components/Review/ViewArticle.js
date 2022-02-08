import Tippy from '@tippyjs/react';
import { toggleHistoryModal as toggleHistoryModalAction } from 'actions/review';
import AuthorBadges from 'components/Badges/AuthorBadges/AuthorBadges';
import ResearchFieldBadge from 'components/Badges/ResearchFieldBadge/ResearchFieldBadge';
import Acknowledgements from 'components/Review/Acknowledgements';
import SectionDataTable from 'components/Review/DataTable/SectionOntology';
import MarkdownRenderer from 'components/Review/MarkdownRenderer';
import Outline from 'components/Review/Outline';
import ListReferences from 'components/Review/References/ListReferences';
import SectionVisualization from 'components/Review/SectionVisualization';
import { SectionStyled } from 'components/ArticleBuilder/styled';
import ViewArticleStatementBrowser from 'components/Review/ViewArticleStatementBrowser';
import StatementBrowser from 'components/StatementBrowser/StatementBrowser';
import MarkFeatured from 'components/MarkFeaturedUnlisted/MarkFeatured/MarkFeatured';
import MarkUnlisted from 'components/MarkFeaturedUnlisted/MarkUnlisted/MarkUnlisted';
import useMarkFeaturedUnlisted from 'components/MarkFeaturedUnlisted/hooks/useMarkFeaturedUnlisted';
import { CLASSES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { Alert, Button, Container } from 'reactstrap';
import SectionComparison from 'components/Review/SectionComparison';

const ViewArticle = () => {
    const { id } = useParams();
    const paper = useSelector(state => state.review.paper);
    const articleResource = useSelector(state => state.review.articleResource);
    const authors = useSelector(state => state.review.authorResources);
    const sections = useSelector(state => state.review.sections);
    const isPublished = useSelector(state => state.review.isPublished);
    const versions = useSelector(state => state.review.versions);
    const researchField = useSelector(state => state.review.researchField);
    const dispatch = useDispatch();
    const latestVersionId = versions?.[0]?.id;
    const newVersionAvailable = isPublished && latestVersionId !== id;
    const toggleHistoryModal = () => dispatch(toggleHistoryModalAction());

    const { isFeatured, isUnlisted, handleChangeStatus } = useMarkFeaturedUnlisted({
        resourceId: id,
        unlisted: articleResource?.unlisted,
        featured: articleResource?.featured
    });

    return (
        <>
            <Container className="print-only p-0" style={{ position: 'relative' }}>
                <Outline />
                {!isPublished && (
                    <Alert color="warning" fade={false} className="box">
                        Warning: you are viewing an unpublished version of this article. The content can be changed by anyone.{' '}
                        <Button color="link" className="p-0" onClick={toggleHistoryModal}>
                            View publish history
                        </Button>
                    </Alert>
                )}
                {newVersionAvailable && (
                    <Alert color="warning" fade={false} className="box">
                        Warning: a newer version of this article is available.{' '}
                        <Link to={reverse(ROUTES.REVIEW, { id: latestVersionId })}>View latest version</Link>
                    </Alert>
                )}
                <main>
                    <article>
                        <SectionStyled className="box rounded">
                            <header>
                                <div className="d-flex mb-2 mt-4">
                                    <h1 style={{ whiteSpace: 'pre-line' }} typeof="doco:Title" property="c4o:hasContent">
                                        {paper.title}{' '}
                                    </h1>
                                    {isPublished && (
                                        <h2 className="h4 ms-2 mt-2">
                                            <MarkFeatured size="xs" featured={isFeatured} handleChangeStatus={handleChangeStatus} />
                                            <div className="d-inline-block ms-1">
                                                <MarkUnlisted size="xs" unlisted={isUnlisted} handleChangeStatus={handleChangeStatus} />
                                            </div>
                                        </h2>
                                    )}
                                </div>
                                <div className="my-3">
                                    <ResearchFieldBadge researchField={researchField} />
                                    <AuthorBadges authors={authors} />{' '}
                                </div>
                            </header>
                            {sections.map(section => {
                                if (
                                    [
                                        CLASSES.RESOURCE_SECTION,
                                        CLASSES.PROPERTY_SECTION,
                                        CLASSES.COMPARISON_SECTION,
                                        CLASSES.VISUALIZATION_SECTION,
                                        CLASSES.ONTOLOGY_SECTION
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
                                                {section.title.label}
                                            </h2>
                                            {section.type.id === CLASSES.ONTOLOGY_SECTION && <SectionDataTable key={section.id} section={section} />}
                                            {section?.contentLink?.objectId && (
                                                <>
                                                    {section.type.id !== CLASSES.COMPARISON_SECTION &&
                                                        section.type.id !== CLASSES.VISUALIZATION_SECTION && (
                                                            <>
                                                                <div className="mt-3 mb-2">
                                                                    <Link
                                                                        to={reverse(
                                                                            section.type.id === CLASSES.RESOURCE_SECTION
                                                                                ? ROUTES.RESOURCE
                                                                                : ROUTES.PREDICATE,
                                                                            {
                                                                                id: section.contentLink.objectId
                                                                            }
                                                                        )}
                                                                        target="_blank"
                                                                    >
                                                                        {section.contentLink.label}
                                                                    </Link>
                                                                </div>
                                                                {!isPublished ? (
                                                                    <StatementBrowser
                                                                        enableEdit={false}
                                                                        initialSubjectId={section.contentLink.objectId}
                                                                        initialSubjectLabel="Main"
                                                                        newStore={true}
                                                                        rootNodeType={
                                                                            section.type.id === CLASSES.RESOURCE_SECTION ? 'resource' : 'predicate'
                                                                        }
                                                                    />
                                                                ) : (
                                                                    <ViewArticleStatementBrowser id={section.contentLink.objectId} />
                                                                )}
                                                            </>
                                                        )}
                                                    {section.type.id === CLASSES.COMPARISON_SECTION && (
                                                        <SectionComparison
                                                            key={section.id}
                                                            id={section.contentLink.objectId}
                                                            sectionId={section.id}
                                                        />
                                                    )}
                                                    {section.type.id === CLASSES.VISUALIZATION_SECTION && (
                                                        <SectionVisualization key={section.id} id={section.contentLink.objectId} />
                                                    )}
                                                </>
                                            )}
                                        </section>
                                    );
                                } else {
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
                                }
                            })}
                            <section typeof="doco:Section deo:Acknowledgements">
                                <h2
                                    id="section-acknowledgements"
                                    className="h4 border-bottom mt-5"
                                    typeof="doco:SectionTitle"
                                    property="c4o:hasContent"
                                >
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
        </>
    );
};

export default ViewArticle;
