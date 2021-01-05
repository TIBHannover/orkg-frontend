import AuthorsList from 'components/SmartArticle/AuthorsList';
import MarkdownRenderer from 'components/SmartArticle/MarkdownRenderer';
import { SectionStyled } from 'components/SmartArticle/styled';
import StatementBrowser from 'components/StatementBrowser/StatementBrowser';
import { CLASSES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Container } from 'reactstrap';
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
    const paper = useSelector(state => state.smartArticle.paper);
    const authors = useSelector(state => state.smartArticle.authorResources);
    const sections = useSelector(state => state.smartArticle.sections);

    return (
        <Container className="print-only">
            <SectionStyled className="box rounded pr-4">
                <h1 className="mb-2 mt-4" style={{ whiteSpace: 'pre-line' }}>
                    {paper.title}
                </h1>
                <div className="my-3">
                    <AuthorsList authors={authors} />
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
                                                <StatementBrowser
                                                    enableEdit={false}
                                                    initialSubjectId={section.contentLink.objectId}
                                                    initialSubjectLabel="Main"
                                                    newStore={true}
                                                    rootNodeType={section.type.id === CLASSES.RESOURCE_SECTION ? 'resource' : 'predicate'}
                                                />
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
            </SectionStyled>
        </Container>
    );
};

export default ViewArticle;
