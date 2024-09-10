import Tippy from '@tippyjs/react';
import MarkdownRenderer from 'components/ArticleBuilder/MarkdownEditor/MarkdownRenderer';
import { SectionStyled } from 'components/ArticleBuilder/styled';
import AuthorBadges from 'components/Badges/AuthorBadges/AuthorBadges';
import ResearchFieldBadge from 'components/Badges/ResearchFieldBadge/ResearchFieldBadge';
import PaperCard from 'components/Cards/PaperCard/PaperCard';
import ComparisonPopup from 'components/ComparisonPopup/ComparisonPopup';
import { supportedContentTypes } from 'components/ContentType/types';
import Contributors from 'components/List/Contributors/Contributors';
import ListEntryAmount from 'components/List/ListEntryAmount/ListEntryAmount';
import SustainableDevelopmentGoals from 'components/List/SustainableDevelopmentGoals/SustainableDevelopmentGoals';
import { isListSection, isTextSection } from 'components/List/helpers/typeGuards';
import useList from 'components/List/hooks/useList';
import MarkFeatured from 'components/MarkFeaturedUnlisted/MarkFeatured/MarkFeatured';
import MarkUnlisted from 'components/MarkFeaturedUnlisted/MarkUnlisted/MarkUnlisted';
import useMarkFeaturedUnlisted from 'components/MarkFeaturedUnlisted/hooks/useMarkFeaturedUnlisted';
import useParams from 'components/useParams/useParams';
import { VISIBILITY } from 'constants/contentTypes';
import { CLASSES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { FC } from 'react';
import { Alert, Button, Container, ListGroup, ListGroupItem } from 'reactstrap';
import { Paper } from 'services/backend/types';

type ListProps = {
    setIsOpenHistoryModal: (isOpen: boolean) => void;
};

const ViewList: FC<ListProps> = ({ setIsOpenHistoryModal }) => {
    const { id } = useParams();
    const { list, getPaperById } = useList();
    const latestVersionId = list?.versions?.published?.[0]?.id;
    const newVersionAvailable = list?.published && latestVersionId !== id;

    const { isFeatured, isUnlisted, handleChangeStatus } = useMarkFeaturedUnlisted({
        resourceId: id,
        unlisted: list?.visibility === VISIBILITY.UNLISTED,
        featured: list?.visibility === VISIBILITY.FEATURED,
    });

    if (!list) {
        return null;
    }

    return (
        <Container className="p-0 position-relative">
            {!list.published && (
                <Alert color="warning" fade={false} className="box-shadow border-0">
                    Warning: you are viewing an unpublished version of this list. The content can be changed by anyone.{' '}
                    <Button color="link" className="p-0" onClick={() => setIsOpenHistoryModal(true)}>
                        View publish history
                    </Button>
                </Alert>
            )}
            {newVersionAvailable && (
                <Alert color="warning" fade={false} className="box-shadow border-0">
                    Warning: a newer version of this list is available.{' '}
                    <Link href={reverse(ROUTES.LIST, { id: latestVersionId })}>View latest version</Link> or{' '}
                    <Link href={reverse(ROUTES.LIST_DIFF, { oldId: id, newId: latestVersionId })}>compare to latest version</Link>.
                </Alert>
            )}
            <main>
                <SectionStyled className="box rounded">
                    <header className="border-bottom">
                        <div className="d-flex justify-content-between">
                            <div className="d-flex mb-2 mt-4">
                                <h1 style={{ whiteSpace: 'pre-line' }}>{list.title}</h1>
                                {list.published && (
                                    <h2 className="h4 ms-2 mt-2">
                                        <MarkFeatured size="xs" featured={isFeatured} handleChangeStatus={handleChangeStatus} />
                                        <div className="d-inline-block ms-1">
                                            <MarkUnlisted size="xs" unlisted={isUnlisted} handleChangeStatus={handleChangeStatus} />
                                        </div>
                                    </h2>
                                )}
                            </div>
                            <div>
                                <SustainableDevelopmentGoals />
                            </div>
                        </div>
                        <div className="my-3">
                            <ResearchFieldBadge researchField={list.research_fields?.[0]} />
                            <ListEntryAmount />
                            <AuthorBadges authors={list.authors} />
                        </div>
                    </header>

                    {list.sections.map((section) => {
                        if (isTextSection(section)) {
                            return (
                                <section key={section.id}>
                                    <h2 className={`h${section?.heading_size} mt-4`}>{section.heading}</h2>
                                    <MarkdownRenderer text={section.text} />
                                </section>
                            );
                        }
                        if (isListSection(section)) {
                            return (
                                <section key={section.id} className="mt-3">
                                    <ListGroup>
                                        {section.entries.map((entry) => {
                                            const isPaper = entry?.value.classes?.includes(CLASSES.PAPER);
                                            const contentTypeClass = entry.value?.classes?.filter((classId) =>
                                                supportedContentTypes.find((c) => c.id === classId),
                                            )?.[0];
                                            const route = !isPaper
                                                ? reverse(ROUTES.CONTENT_TYPE, { id: entry.value?.id, type: contentTypeClass })
                                                : undefined;

                                            const data: Partial<Paper> = {
                                                id: entry.value?.id,
                                                title: entry.value?.label,
                                            };

                                            return (
                                                <ListGroupItem key={entry.value?.id} className="p-0">
                                                    <PaperCard
                                                        showCurationFlags={false}
                                                        isListGroupItem={false}
                                                        showBreadcrumbs={false}
                                                        showCreator={false}
                                                        description={entry.description}
                                                        paper={getPaperById(entry.value?.id) || data}
                                                        showAddToComparison
                                                        linkTarget="_blank"
                                                        showContributionCount={isPaper}
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
                        <Contributors />
                    </section>
                </SectionStyled>
            </main>
            <ComparisonPopup />
        </Container>
    );
};

export default ViewList;
