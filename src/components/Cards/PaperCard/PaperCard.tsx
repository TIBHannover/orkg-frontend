import { faCalendar, faFile } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Checkbox, Chip } from '@heroui/react';
import dayjs from 'dayjs';
import Link from 'next/link';
import pluralize from 'pluralize';
import { ChangeEvent, FC } from 'react';

import AddToComparison from '@/components/Cards/PaperCard/AddToComparison';
import Authors from '@/components/Cards/PaperCard/Authors';
import Description from '@/components/Cards/PaperCard/Description/Description';
import Paths from '@/components/Cards/PaperCard/Paths';
import Coins from '@/components/Coins/Coins';
import useMarkFeaturedUnlisted from '@/components/MarkFeaturedUnlisted/hooks/useMarkFeaturedUnlisted';
import MarkFeatured from '@/components/MarkFeaturedUnlisted/MarkFeatured/MarkFeatured';
import MarkUnlisted from '@/components/MarkFeaturedUnlisted/MarkUnlisted/MarkUnlisted';
import PaperTitle from '@/components/PaperTitle/PaperTitle';
import RelativeBreadcrumbs from '@/components/RelativeBreadcrumbs/RelativeBreadcrumbs';
import UserAvatar from '@/components/UserAvatar/UserAvatar';
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
}) => {
    const showActionButtons = showAddToComparison || selectable || showCurationFlags;
    const { isFeatured, isUnlisted, handleChangeStatus } = useMarkFeaturedUnlisted({
        resourceId: paper.id ?? '',
        unlisted: paper?.visibility === VISIBILITY.UNLISTED,
        featured: paper?.visibility === VISIBILITY.FEATURED,
    });

    return (
        <div
            className={`${isListGroupItem ? 'list-group-item' : ''} flex flex-wrap py-4 pr-6 ${showActionButtons ? 'pl-4' : 'pl-6'} ${selected ? 'bg-default' : ''}`}
        >
            <div className="flex w-full items-start p-0 md:w-9/12 md:shrink-0 md:grow-0 md:basis-9/12 md:max-w-9/12">
                {renderCoins && <Coins item={paper} />}
                {showActionButtons && (
                    <div className="mt-0.5 flex w-[25px] shrink-0 flex-col gap-1">
                        {selectable && (
                            <div>
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
                            </div>
                        )}
                        {!selectable && showAddToComparison && !!paper.contributions?.length && (
                            <div>
                                <AddToComparison paper={paper as Paper} />
                            </div>
                        )}
                        {showCurationFlags && (
                            <>
                                <div>
                                    <MarkFeatured size="sm" featured={isFeatured} handleChangeStatus={handleChangeStatus} />
                                </div>
                                <div>
                                    <MarkUnlisted size="sm" unlisted={isUnlisted} handleChangeStatus={handleChangeStatus} />
                                </div>
                            </>
                        )}
                    </div>
                )}
                <div className="flex grow flex-col">
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
                                <Chip color="accent" variant="primary" size="sm">
                                    Paper
                                </Chip>
                            </span>
                        )}
                    </div>
                    <div>
                        <div className="mr-1 mt-1 inline-block md:hidden">
                            {showBreadcrumbs && <RelativeBreadcrumbs researchField={paper.research_fields?.[0]} />}
                        </div>
                    </div>
                    <div className="mb-1">
                        <small>
                            {showContributionCount && (
                                <div className="mr-1 inline-block">
                                    <FontAwesomeIcon size="sm" icon={faFile} className="mr-1 text-muted" />
                                    {pluralize('contribution', paper.contributions?.length, true)}
                                </div>
                            )}
                            <Authors authors={paper.authors} />
                            {(paper.publication_info?.published_month || paper.publication_info?.published_year) && (
                                <FontAwesomeIcon size="sm" icon={faCalendar} className="ml-2 mr-1 text-muted" />
                            )}
                            {paper.publication_info?.published_month && paper.publication_info?.published_month > 0
                                ? dayjs()
                                      .month(paper.publication_info?.published_month - 1)
                                      .format('MMMM')
                                : ''}{' '}
                            {paper.publication_info?.published_year ?? null}
                        </small>
                        <Description description={description} isEditable={isDescriptionEditable} handleUpdate={handleUpdateDescription} />
                    </div>
                </div>
            </div>
            <div className="flex w-full flex-col items-end p-0 md:w-3/12 md:shrink-0 md:grow-0 md:basis-3/12 md:max-w-3/12">
                <div className="mb-1 grow">
                    <div className="hidden items-end justify-end md:flex">
                        {showBreadcrumbs && <RelativeBreadcrumbs researchField={paper.research_fields?.[0]} />}
                    </div>
                </div>
                {showCreator && <UserAvatar userId={paper.created_by} />}
            </div>
            {paths && paths?.length > 0 && (
                <div className={`${showActionButtons ? 'pl-6' : 'pl-12'} mb-1`}>
                    <small>
                        <Paths paths={paths} />
                    </small>
                </div>
            )}
        </div>
    );
};

export default PaperCard;
