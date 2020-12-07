import AuthorsList from 'components/SmartArticle/AuthorsList';
import { SectionStyled } from 'components/SmartArticle/styled';
import React from 'react';
import { useSelector } from 'react-redux';
import { Container } from 'reactstrap';
import * as Showdown from 'showdown';

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
                    //if (section.type === '')
                    return (
                        <React.Fragment key={section.id}>
                            <h2 className="h4 border-bottom mt-4">{section.title.label}</h2>
                            <p dangerouslySetInnerHTML={{ __html: converter.makeHtml(section.markdown.label) }} />
                        </React.Fragment>
                    );
                })}
            </SectionStyled>
        </Container>
    );
};

export default ViewArticle;
