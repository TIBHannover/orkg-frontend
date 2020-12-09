import AuthorsList from 'components/SmartArticle/AuthorsList';
import { SectionStyled } from 'components/SmartArticle/styled';
import React from 'react';
import { useSelector } from 'react-redux';
import { Container } from 'reactstrap';
import * as Showdown from 'showdown';
import StatementBrowser from 'components/StatementBrowser/Statements/StatementsContainer';
import { CLASSES } from 'constants/graphSettings';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes';

const converter = new Showdown.Converter({
    tables: true,
    simplifiedAutoLink: true,
    strikethrough: true,
    tasklists: true
});

const ViewArticle = () => {
    const title = useSelector(state => state.smartArticle.paperResource);
    const authors = useSelector(state => state.smartArticle.authorResources);
    const sections = useSelector(state => state.smartArticle.sections);

    return (
        <Container className="print-only">
            <SectionStyled className="box rounded pr-4">
                <h1 className="mb-2 mt-4">{title.label}</h1>
                <div className="my-3">
                    <AuthorsList authors={authors} />
                </div>
                {sections.map(section => {
                    if (section.type.id === CLASSES.RESOURCE_SECTION || section.type.id === CLASSES.PROPERTY_SECTION) {
                        return (
                            <React.Fragment key={section.id}>
                                <h2 className="h4 border-bottom mt-4">{section.title.label}</h2>
                                {section?.contentLink?.objectId && (
                                    <>
                                        <div className="mt-3 mb-2">
                                            <Link
                                                to={reverse(section.type.id === CLASSES.RESOURCE_SECTION ? ROUTES.RESOURCE : ROUTES.PREDICATE, {
                                                    id: section.contentLink.objectId
                                                })}
                                                target="_blank"
                                            >
                                                {section.contentLink.label}
                                            </Link>
                                        </div>
                                        <StatementBrowser
                                            enableEdit={false}
                                            initialResourceId={section.contentLink.objectId}
                                            initialResourceLabel="Main"
                                            newStore={true}
                                            rootNodeType={section.type.id === CLASSES.RESOURCE_SECTION ? 'resource' : 'predicate'}
                                        />
                                    </>
                                )}
                            </React.Fragment>
                        );
                    } else {
                        return (
                            <React.Fragment key={section.id}>
                                <h2 className="h4 border-bottom mt-4">{section.title.label}</h2>
                                <p dangerouslySetInnerHTML={{ __html: converter.makeHtml(section.markdown.label) }} />
                            </React.Fragment>
                        );
                    }
                })}
            </SectionStyled>
        </Container>
    );
};

export default ViewArticle;
