import { faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import { toggleHistoryModal as toggleHistoryModalAction } from 'actions/smartArticle';
import Acknowledgements from 'components/SmartArticle/Acknowledgements';
import AuthorsList from 'components/SmartArticle/AuthorsList';
import MarkdownRenderer from 'components/SmartArticle/MarkdownRenderer';
import { SectionStyled } from 'components/SmartArticle/styled';
import ViewArticleStatementBrowser from 'components/SmartArticle/ViewArticleStatementBrowser';
import StatementBrowser from 'components/StatementBrowser/StatementBrowser';
import { CLASSES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { Alert, Badge, Button, Container } from 'reactstrap';
import * as Showdown from 'showdown';
import footnotes from 'showdown-footnotes';
import SectionComparison from './SectionComparison';

const converter = new Showdown.Converter({
    //tables: true,
    //simplifiedAutoLink: true,
    //strikethrough: true,
    //tasklists: true,
    extensions: [footnotes]
});
converter.setFlavor('github');

const ViewArticle = () => {
    const { id } = useParams();
    const paper = useSelector(state => state.smartArticle.paper);
    const authors = useSelector(state => state.smartArticle.authorResources);
    const sections = useSelector(state => state.smartArticle.sections);
    const isPublished = useSelector(state => state.smartArticle.isPublished);
    const versions = useSelector(state => state.smartArticle.versions);
    const researchField = useSelector(state => state.smartArticle.researchField);
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
                        <Link to={reverse(ROUTES.SMART_ARTICLE, { id: latestVersionId })}>View latest version</Link>
                    </Alert>
                )}
                <SectionStyled className="box rounded pr-4">
                    <h1 className="mb-2 mt-4" style={{ whiteSpace: 'pre-line' }}>
                        {paper.title}
                    </h1>
                    <div className="my-3">
                        {researchField && (
                            <Link to={reverse(ROUTES.RESEARCH_FIELD, { researchFieldId: researchField.id })} target="_blank">
                                <Badge color="lightblue" className="mr-2 mb-2">
                                    <Icon icon={faBars} className="text-primary" /> {researchField.label}
                                </Badge>
                            </Link>
                        )}
                        <AuthorsList authors={authors} />{' '}
                    </div>
                    {sections.map(section => {
                        if (
                            section.type.id === CLASSES.RESOURCE_SECTION ||
                            section.type.id === CLASSES.PROPERTY_SECTION ||
                            section.type.id === CLASSES.COMPARISON_SECTION
                        ) {
                            return (
                                <React.Fragment key={section.id}>
                                    <h2 className="h4 border-bottom mt-5">{section.title.label}</h2>
                                    {section?.contentLink?.objectId && (
                                        <>
                                            {section.type.id !== CLASSES.COMPARISON_SECTION ? (
                                                <>
                                                    <div className="mt-3 mb-2">
                                                        <Link
                                                            to={reverse(
                                                                section.type.id === CLASSES.RESOURCE_SECTION ? ROUTES.RESOURCE : ROUTES.PREDICATE,
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
                                                            rootNodeType={section.type.id === CLASSES.RESOURCE_SECTION ? 'resource' : 'predicate'}
                                                        />
                                                    ) : (
                                                        <ViewArticleStatementBrowser id={section.contentLink.objectId} />
                                                    )}
                                                </>
                                            ) : (
                                                <SectionComparison key={section.id} id={section.contentLink.objectId} />
                                            )}
                                        </>
                                    )}
                                </React.Fragment>
                            );
                        } else {
                            return (
                                <React.Fragment key={section.id}>
                                    <h2 className="h4 border-bottom mt-4" style={{ whiteSpace: 'pre-line' }}>
                                        {section.title.label}
                                    </h2>
                                    <MarkdownRenderer text={section.markdown.label} />
                                </React.Fragment>
                            );
                        }
                    })}
                    <h2 className="h4 border-bottom mt-5">
                        <Tippy content="Acknowledgements are automatically generated based on ORKG users that contributed to resources used in this article">
                            <span>Acknowledgements</span>
                        </Tippy>
                    </h2>
                    <Acknowledgements />
                </SectionStyled>
            </Container>
        </>
    );
};

export default ViewArticle;
