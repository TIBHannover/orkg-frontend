import { faCalendar, faFile } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Checkbox } from '@heroui/react';
import dayjs from 'dayjs';
import Link from 'next/link';
import pluralize from 'pluralize';
import { ChangeEvent, FC } from 'react';

import CardBadge from '@/components/Cards/CardBadge/CardBadge';
import CardColumns from '@/components/Cards/CardShell/CardColumns';
import CardShell from '@/components/Cards/CardShell/CardShell';
import MetadataRow from '@/components/Cards/CardShell/MetadataRow';
import AddToComparison from '@/components/Cards/PaperCard/AddToComparison';
import Authors from '@/components/Cards/PaperCard/Authors';
import Description from '@/components/Cards/PaperCard/Description/Description';
import Paths from '@/components/Cards/PaperCard/Paths';
import Versions from '@/components/Cards/PaperCard/Versions';
import Coins from '@/components/Coins/Coins';
import useMarkFeaturedUnlisted from '@/components/MarkFeaturedUnlisted/hooks/useMarkFeaturedUnlisted';
import MarkFeatured from '@/components/MarkFeaturedUnlisted/MarkFeatured/MarkFeatured';
import MarkUnlisted from '@/components/MarkFeaturedUnlisted/MarkUnlisted/MarkUnlisted';
import PaperTitle from '@/components/PaperTitle/PaperTitle';
import { VISIBILITY } from '@/constants/contentTypes';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { Paper, Resource } from '@/services/backend/types';

type PaperCardType = {
    paper: Partial<Paper>;
    onSelect?: (event: ChangeEvent<HTMLInputElement>) => void;
    paths?: Resource[][];
    selectable?: boolean;
    linkTarget?: string;
    selected?: boolean;
    showBreadcrumbs?: boolean;
    showCreator?: boolean;
    showAddToComparison?: boolean;
    showBadge?: boolean;
    showCurationFlags?: boolean;
    isListGroupItem?: boolean;
    description?: string;
    showContributionCount?: boolean;
    isDescriptionEditable?: boolean;
    route?: string;
    handleUpdateDescription?: (description: string) => void;
    renderCoins?: boolean;
    showVersions?: boolean;
};

const PaperCard: FC<PaperCardType> = ({
    paper,
    onSelect = () => {},
    paths,
    selectable = false,
    linkTarget = '_self',
    selected = false,
    showBreadcrumbs = true,
    showCreator = true,
    showAddToComparison = true,
    showBadge = false,
    showCurationFlags = true,
    isListGroupItem = true,
    description = null,
    isDescriptionEditable = false,
    handleUpdateDescription = () => {},
    showContributionCount = false,
    route = null,
    renderCoins = true,
    showVersions = true,
}) => {
    const showActionButtons = showAddToComparison || selectable || showCurationFlags;
    const publishedVersions = paper.versions?.published ?? [];
    const { publishedMonth, publishedYear } = paper.publicationInfo ?? {};
    const publicationDate = [
        publishedMonth && publishedMonth > 0
            ? dayjs()
                  .month(publishedMonth - 1)
                  .format('MMMM')
            : undefined,
        publishedYear ?? undefined,
    ]
        .filter(Boolean)
        .join(' ');
    const { isFeatured, isUnlisted, handleChangeStatus } = useMarkFeaturedUnlisted({
        resourceId: paper.id ?? '',
        unlisted: paper?.visibility === VISIBILITY.UNLISTED,
        featured: paper?.visibility === VISIBILITY.FEATURED,
    });

    return (
        <CardShell asListItem={isListGroupItem} className={selected ? 'bg-default' : undefined}>
            <CardColumns
                gutter={
                    showActionButtons && (
                        <>
                            {selectable && (
                                <Checkbox
                                    id={`${paper.id}input`}
                                    isSelected={selected}
                                    onChange={(isSelected: boolean) => {
                                        const syntheticEvent = { target: { checked: isSelected } } as ChangeEvent<HTMLInputElement>;
                                        onSelect(syntheticEvent);
                                    }}
                                    aria-label="Select paper"
                                >
                                    <Checkbox.Content>
                                        <Checkbox.Control>
                                            <Checkbox.Indicator />
                                        </Checkbox.Control>
                                    </Checkbox.Content>
                                </Checkbox>
                            )}
                            {!selectable && showAddToComparison && !!paper.contributions?.length && <AddToComparison paper={paper as Paper} />}
                            {showCurationFlags && (
                                <>
                                    <MarkFeatured size="sm" featured={isFeatured} handleChangeStatus={handleChangeStatus} />
                                    <MarkUnlisted size="sm" unlisted={isUnlisted} handleChangeStatus={handleChangeStatus} />
                                </>
                            )}
                        </>
                    )
                }
                researchField={showBreadcrumbs ? paper.researchFields?.[0] : undefined}
                createdBy={showCreator ? paper.createdBy : undefined}
            >
                {renderCoins && <Coins item={paper} />}
                <div className="mb-2">
                    <Link
                        target={linkTarget || undefined}
                        href={
                            route ||
                            reverse(ROUTES.VIEW_PAPER, {
                                resourceId: paper.id,
                            })
                        }
                    >
                        <PaperTitle title={paper.title} />
                    </Link>
                    {showBadge && (
                        <span className="ml-2 inline-block align-middle">
                            <CardBadge>Paper</CardBadge>
                        </span>
                    )}
                </div>
                <div className="mb-1">
                    <MetadataRow
                        items={[
                            showContributionCount && {
                                key: 'contributions',
                                node: (
                                    <span className="inline-flex items-center">
                                        <FontAwesomeIcon size="sm" icon={faFile} className="me-1 text-muted" />
                                        {pluralize('contribution', paper.contributions?.length ?? 0, true)}
                                    </span>
                                ),
                            },
                            !!paper.authors?.length && { key: 'authors', node: <Authors authors={paper.authors} /> },
                            !!publicationDate && {
                                key: 'published',
                                node: (
                                    <span className="inline-flex items-center" title={`Published ${publicationDate}`}>
                                        <FontAwesomeIcon size="sm" icon={faCalendar} className="me-1 text-muted" />
                                        <span className="sr-only">Published </span>
                                        {publicationDate}
                                    </span>
                                ),
                            },
                        ]}
                    />
                    <Description description={description} isEditable={isDescriptionEditable} handleUpdate={handleUpdateDescription} />
                </div>
                {showVersions && publishedVersions.length > 0 && <Versions versions={publishedVersions} />}
            </CardColumns>
            {paths && paths?.length > 0 && (
                <div className={`text-sm ${showActionButtons ? 'pl-6' : 'pl-12'}`}>
                    <Paths paths={paths} />
                </div>
            )}
        </CardShell>
    );
};

export default PaperCard;
