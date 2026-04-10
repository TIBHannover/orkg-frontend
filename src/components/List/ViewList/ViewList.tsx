import { Alert, Button } from '@heroui/react';
import Link from 'next/link';
import { FC } from 'react';

import MarkdownRenderer from '@/components/ArticleBuilder/MarkdownEditor/MarkdownRenderer';
import AuthorBadges from '@/components/Badges/AuthorBadges/AuthorBadges';
import PublishedBadge from '@/components/Badges/PublishedBadge/PublishedBadge';
import ResearchFieldBadge from '@/components/Badges/ResearchFieldBadge/ResearchFieldBadge';
import PaperCard from '@/components/Cards/PaperCard/PaperCard';
import { additionalContentTypes } from '@/components/ContentType/types';
import Tooltip from '@/components/FloatingUI/Tooltip';
import Contributors from '@/components/List/Contributors/Contributors';
import { isListSection, isTextSection } from '@/components/List/helpers/typeGuards';
import useList from '@/components/List/hooks/useList';
import ListEntryAmount from '@/components/List/ListEntryAmount/ListEntryAmount';
import SustainableDevelopmentGoals from '@/components/List/SustainableDevelopmentGoals/SustainableDevelopmentGoals';
import useMarkFeaturedUnlisted from '@/components/MarkFeaturedUnlisted/hooks/useMarkFeaturedUnlisted';
import MarkFeatured from '@/components/MarkFeaturedUnlisted/MarkFeatured/MarkFeatured';
import MarkUnlisted from '@/components/MarkFeaturedUnlisted/MarkUnlisted/MarkUnlisted';
import ObservatoryBox from '@/components/ObservatoryBox/ObservatoryBox';
import Container from '@/components/Ui/Structure/Container';
import useParams from '@/components/useParams/useParams';
import { VISIBILITY } from '@/constants/contentTypes';
import { CLASSES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { Paper } from '@/services/backend/types';

type ListProps = {
    setIsOpenHistoryModal: (isOpen: boolean) => void;
};

const ViewList: FC<ListProps> = ({ setIsOpenHistoryModal }) => {
    const { id } = useParams();
    const { list, getPaperById, observatory, organization } = useList();
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
        <Container className="relative">
            {!list.published && (
                <Alert status="warning" className="mt-2 mb-4 rounded-2xl flex-row items-center shadow">
                    <Alert.Indicator />
                    <Alert.Content>
                        <Alert.Title>Unpublished version</Alert.Title>
                        <Alert.Description>
                            You are viewing an unpublished version of this list. The content can be changed by anyone.{' '}
                            <Button variant="primary" className="px-2 py-1" onPress={() => setIsOpenHistoryModal(true)} size="sm">
                                View publish history
                            </Button>
                        </Alert.Description>
                    </Alert.Content>
                </Alert>
            )}
            {newVersionAvailable && (
                <Alert status="accent" className="mt-2 mb-4 rounded-2xl flex-row items-center">
                    <Alert.Indicator />
                    <Alert.Content>
                        <Alert.Title>Newer version available</Alert.Title>
                        <Alert.Description>
                            A newer version of this list is available.{' '}
                            <Link href={reverse(ROUTES.LIST, { id: latestVersionId })}>View latest version</Link> or{' '}
                            <Link href={reverse(ROUTES.LIST_DIFF, { oldId: id, newId: latestVersionId })}>compare to latest version</Link>.
                        </Alert.Description>
                    </Alert.Content>
                </Alert>
            )}
            <div>
                <div className="relative px-10 py-2.5 box rounded [&_a]:underline">
                    <header className="border-b pb-2">
                        <div className="flex justify-between">
                            <div>
                                <div className="flex mb-2 mt-6">
                                    <h1 style={{ whiteSpace: 'pre-line' }}>{list.title}</h1>
                                    {list.published && (
                                        <h2 className="text-2xl ml-2 mt-2">
                                            <MarkFeatured size="xs" featured={isFeatured} handleChangeStatus={handleChangeStatus} />
                                            <div className="inline-block ml-1">
                                                <MarkUnlisted size="xs" unlisted={isUnlisted} handleChangeStatus={handleChangeStatus} />
                                            </div>
                                        </h2>
                                    )}
                                </div>
                                <div className="my-4">
                                    {list.published && <PublishedBadge />}
                                    <ResearchFieldBadge researchField={list.research_fields?.[0]} />
                                    <ListEntryAmount />
                                    <AuthorBadges authors={list.authors} />
                                    {list.identifiers?.doi?.[0] && (
                                        <div className="mb-1">
                                            <small>
                                                DOI:{' '}
                                                <a href={`https://doi.org/${list.identifiers.doi[0]}`} target="_blank" rel="noopener noreferrer">
                                                    https://doi.org/{list.identifiers.doi[0]}
                                                </a>
                                            </small>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <div className="flex flex-col items-end gap-2 mt-2 border-start border-default pl-6">
                                    <ObservatoryBox resourceId={list.id} observatory={observatory} organization={organization} />
                                    <div style={{ marginRight: -25 }}>
                                        <SustainableDevelopmentGoals />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>

                    {list.sections.map((section) => {
                        if (isTextSection(section)) {
                            return (
                                <section key={section.id}>
                                    <h2 className={`h${section?.heading_size} mt-6`}>{section.heading}</h2>
                                    <MarkdownRenderer text={section.text} />
                                </section>
                            );
                        }
                        if (isListSection(section)) {
                            return (
                                <section key={section.id} className="mt-4">
                                    <ul className="m-0 flex w-full flex-col divide-y divide-border overflow-hidden rounded-[var(--radius)] border border-border bg-surface p-0 list-none">
                                        {section.entries.map((entry) => {
                                            const isPaper = entry?.value.classes?.includes(CLASSES.PAPER);
                                            const contentTypeClass = entry.value?.classes?.filter((classId) =>
                                                additionalContentTypes.find((c) => c.id === classId),
                                            )?.[0];
                                            const route = !isPaper
                                                ? reverse(ROUTES.CONTENT_TYPE, { id: entry.value?.id, type: contentTypeClass })
                                                : undefined;

                                            const data: Partial<Paper> = {
                                                id: entry.value?.id,
                                                title: entry.value?.label,
                                            };

                                            return (
                                                <li key={entry.value?.id} className="block w-full min-w-0 bg-surface p-0 text-foreground">
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
                                                        renderCoins={isPaper}
                                                    />
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </section>
                            );
                        }
                        return null;
                    })}

                    <section>
                        <h2 className="text-2xl border-b mt-12">
                            <Tooltip content="Contributors are automatically generated based on ORKG users that contributed to this list">
                                <span>Contributors</span>
                            </Tooltip>
                        </h2>
                        <Contributors />
                    </section>
                </div>
            </div>
        </Container>
    );
};

export default ViewList;
