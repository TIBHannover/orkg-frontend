import Tippy from '@tippyjs/react';
import { SectionStyled } from 'components/ArticleBuilder/styled';
import AuthorBadges from 'components/Badges/AuthorBadges/AuthorBadges';
import ResearchFieldBadge from 'components/Badges/ResearchFieldBadge/ResearchFieldBadge';
import ComparisonPopup from 'components/ComparisonPopup/ComparisonPopup';
import Contributors from 'components/List/Contributors';
import PaperCard from 'components/PaperCard/PaperCard';
import { CLASSES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import MarkdownRenderer from 'components/ArticleBuilder/MarkdownEditor/MarkdownRenderer';
import MarkFeatured from 'components/MarkFeaturedUnlisted/MarkFeatured/MarkFeatured';
import MarkUnlisted from 'components/MarkFeaturedUnlisted/MarkUnlisted/MarkUnlisted';
import useMarkFeaturedUnlisted from 'components/MarkFeaturedUnlisted/hooks/useMarkFeaturedUnlisted';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { Alert, Button, Container, ListGroup, ListGroupItem } from 'reactstrap';
import { historyModalToggled } from 'slices/listSlice';
import ListEntryAmount from 'components/List/ListEntryAmount/ListEntryAmount';
import { supportedContentTypes } from 'components/ContentType/types';

const ViewList = ({ isEmbedded }) => {
    const { id } = useParams();
    const list = useSelector(state => state.list.list);
    const listResource = useSelector(state => state.list.listResource);
    const authors = useSelector(state => state.list.authorResources);
    const sections = useSelector(state => state.list.sections);
    const isPublished = useSelector(state => state.list.isPublished);
    const versions = useSelector(state => state.list.versions);
    const researchField = useSelector(state => state.list.researchField);
    const contentTypes = useSelector(state => state.list.contentTypes);
    const dispatch = useDispatch();
    const latestVersionId = versions?.[0]?.id;
    const newVersionAvailable = isPublished && latestVersionId !== id;
    const toggleHistoryModal = () => dispatch(historyModalToggled());

    const { isFeatured, isUnlisted, handleChangeStatus } = useMarkFeaturedUnlisted({
        resourceId: id,
        unlisted: listResource?.unlisted,
        featured: listResource?.featured
    });

    return (
        <Container className="embed-only p-0 position-relative">
            {!isPublished && (
                <Alert color="warning" fade={false} className="box border-0">
                    Warning: you are viewing an unpublished version of this list. The content can be changed by anyone.{' '}
                    <Button color="link" className="p-0" onClick={toggleHistoryModal}>
                        View publish history
                    </Button>
                </Alert>
            )}
            {newVersionAvailable && (
                <Alert color="warning" fade={false} className="box border-0">
                    Warning: a newer version of this list is available.{' '}
                    <Link to={reverse(ROUTES.LIST, { id: latestVersionId })}>View latest version</Link>
                </Alert>
            )}
            <main>
                <SectionStyled className="box rounded">
                    <header className="border-bottom">
                        <div className="d-flex mb-2 mt-4">
                            <h1 style={{ whiteSpace: 'pre-line' }}>{list.title}</h1>
                            {isPublished && !isEmbedded && (
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
                            <ListEntryAmount />
                            <AuthorBadges authors={authors} />
                        </div>
                    </header>

                    {sections.map(section => {
                        if (section.type === CLASSES.TEXT_SECTION) {
                            return (
                                <section key={section.id}>
                                    <h2 className={`h${section?.heading?.level} mt-4`}>{section.title}</h2>
                                    <MarkdownRenderer text={section.content.text} />
                                </section>
                            );
                        } else if (section.type === CLASSES.LIST_SECTION) {
                            return (
                                <section key={section.id} className="mt-3">
                                    <ListGroup>
                                        {section.entries.map(entry => {
                                            const contentType = contentTypes[entry.contentTypeId];
                                            const isPaper = contentType.classes?.includes(CLASSES.PAPER);
                                            const contentTypeClass = contentType.classes?.filter(classId =>
                                                supportedContentTypes.find(c => c.id === classId)
                                            )?.[0];
                                            const route = !isPaper
                                                ? reverse(ROUTES.CONTENT_TYPE_NO_MODE, { id: contentType.id, type: contentTypeClass })
                                                : undefined;

                                            return (
                                                <ListGroupItem key={entry.statementId} className="p-0">
                                                    <PaperCard
                                                        showCurationFlags={false}
                                                        isListGroupItem={false}
                                                        showBreadcrumbs={false}
                                                        showCreator={false}
                                                        description={entry.description}
                                                        paper={{
                                                            ...contentType,
                                                            title: contentType.label
                                                        }}
                                                        showAddToComparison={!isEmbedded}
                                                        linkTarget="_blank"
                                                        showContributionCount={true}
                                                        route={route}
                                                    />
                                                </ListGroupItem>
                                            );
                                        })}
                                    </ListGroup>
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
                        <Contributors isEmbedded={isEmbedded} />
                    </section>
                </SectionStyled>
            </main>

            <ComparisonPopup />
        </Container>
    );
};

ViewList.propTypes = {
    isEmbedded: PropTypes.bool.isRequired
};

export default ViewList;
