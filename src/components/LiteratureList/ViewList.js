import Tippy from '@tippyjs/react';
import { toggleHistoryModal as toggleHistoryModalAction } from 'actions/literatureList';
import AuthorBadges from 'components/Badges/AuthorBadges/AuthorBadges';
import ResearchFieldBadge from 'components/Badges/ResearchFieldBadge/ResearchFieldBadge';
import Contributors from 'components/LiteratureList/Contributors';
import { SectionStyled } from 'components/ArticleBuilder/styled';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { Alert, Button, Container } from 'reactstrap';
import { CLASSES } from 'constants/graphSettings';

const ViewList = () => {
    const { id } = useParams();
    const literatureList = useSelector(state => state.literatureList.literatureList);
    const authors = useSelector(state => state.literatureList.authorResources);
    const sections = useSelector(state => state.literatureList.sections);
    const isPublished = useSelector(state => state.literatureList.isPublished);
    const versions = useSelector(state => state.literatureList.versions);
    const researchField = useSelector(state => state.literatureList.researchField);
    const dispatch = useDispatch();
    const latestVersionId = versions?.[0]?.id;
    const newVersionAvailable = isPublished && latestVersionId !== id;
    const toggleHistoryModal = () => dispatch(toggleHistoryModalAction());

    return (
        <Container className="print-only p-0 position-relative">
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
                    <Link to={reverse(ROUTES.LITERATURE_LIST, { id: latestVersionId })}>View latest version</Link>
                </Alert>
            )}
            <main>
                <SectionStyled className="box rounded">
                    <header>
                        <h1 className="mb-2 mt-4" style={{ whiteSpace: 'pre-line' }}>
                            {literatureList.title}
                        </h1>
                        <div className="my-3">
                            <ResearchFieldBadge researchField={researchField} />
                            <AuthorBadges authors={authors} />{' '}
                        </div>
                    </header>

                    {sections.map(section => {
                        if (section.type === CLASSES.TEXT_SECTION) {
                            return (
                                <section key={section.id}>
                                    <h2 className="h4 border-bottom mt-5">{section.title}</h2>
                                    {section.content.text}
                                </section>
                            );
                        }
                        return null;
                    })}

                    <section>
                        <h2 className="h4 border-bottom mt-5">
                            <Tippy content="Contributors are automatically generated based on ORKG users that contributed to this list">
                                <span>Contributors</span>
                            </Tippy>
                        </h2>
                        <Contributors />
                    </section>
                </SectionStyled>
            </main>
        </Container>
    );
};

export default ViewList;
