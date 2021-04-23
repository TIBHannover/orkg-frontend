import { faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import { toggleHistoryModal as toggleHistoryModalAction } from 'actions/smartReview';
import Acknowledgements from 'components/SmartReview/Acknowledgements';
import AuthorsList from 'components/SmartReview/AuthorsList';
import MarkdownRenderer from 'components/SmartReview/MarkdownRenderer';
import SectionVisualization from 'components/SmartReview/SectionVisualization';
import { SectionStyled } from 'components/SmartReview/styled';
import ViewArticleStatementBrowser from 'components/SmartReview/ViewArticleStatementBrowser';
import StatementBrowser from 'components/StatementBrowser/StatementBrowser';
import { CLASSES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { Alert, Badge, Button, Container } from 'reactstrap';
import SectionComparison from './SectionComparison';

const ViewArticle = () => {
    const { id } = useParams();
    const paper = useSelector(state => state.smartReview.paper);
    const authors = useSelector(state => state.smartReview.authorResources);
    const sections = useSelector(state => state.smartReview.sections);
    const isPublished = useSelector(state => state.smartReview.isPublished);
    const versions = useSelector(state => state.smartReview.versions);
    const researchField = useSelector(state => state.smartReview.researchField);
    const dispatch = useDispatch();
    const latestVersionId = versions?.[0]?.id;
    const newVersionAvailable = isPublished && latestVersionId !== id;

    const toggleHistoryModal = () => dispatch(toggleHistoryModalAction());

    return (
        <>
            <Container className="print-only p-0">
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
                        <Link to={reverse(ROUTES.SMART_REVIEW, { id: latestVersionId })}>View latest version</Link>
                    </Alert>
                )}
                <main>
                    <article>
                        <SectionStyled className="box rounded pr-4">
                            <header>
                                <h1 className="mb-2 mt-4" style={{ whiteSpace: 'pre-line' }} typeof="doco:Title" property="c4o:hasContent">
                                    {paper.title}
                                </h1>
                                <div className="my-3">
                                    {researchField && (
                                        <Link to={reverse(ROUTES.RESEARCH_FIELD, { researchFieldId: researchField.id })} target="_blank">
                                            <Badge color="light" className="mr-2 mb-2">
                                                <Icon icon={faBars} className="text-primary" /> {researchField.label}
                                            </Badge>
                                        </Link>
                                    )}
                                    <AuthorsList authors={authors} />{' '}
                                </div>
                            </header>
                            {sections.map(section => {
                                if (
                                    [
                                        CLASSES.RESOURCE_SECTION,
                                        CLASSES.PROPERTY_SECTION,
                                        CLASSES.COMPARISON_SECTION,
                                        CLASSES.VISUALIZATION_SECTION
                                    ].includes(section.type.id)
                                ) {
                                    return (
                                        <section key={section.id} typeof="doco:Section">
                                            <h2 className="h4 border-bottom mt-5" typeof="doco:SectionTitle" property="c4o:hasContent">
                                                {section.title.label}
                                            </h2>
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
                                                        <SectionComparison key={section.id} id={section.contentLink.objectId} />
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
                                            >
                                                {section.title.label}
                                            </h2>
                                            <MarkdownRenderer text={section.markdown.label} />
                                        </section>
                                    );
                                }
                            })}
                            <section typeof="doco:Section deo:Acknowledgements">
                                <h2 className="h4 border-bottom mt-5" typeof="doco:SectionTitle" property="c4o:hasContent">
                                    <Tippy content="Acknowledgements are automatically generated based on ORKG users that contributed to resources used in this article">
                                        <span>Acknowledgements</span>
                                    </Tippy>
                                </h2>
                                <Acknowledgements />
                            </section>
                        </SectionStyled>
                    </article>
                </main>
            </Container>
        </>
    );
};

export default ViewArticle;
