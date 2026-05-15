import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Chip, Tooltip } from '@heroui/react';
import dayjs from 'dayjs';
import Link from 'next/link';
import { FC } from 'react';

import Authors from '@/components/Cards/PaperCard/Authors';
import Coins from '@/components/Coins/Coins';
import useMarkFeaturedUnlisted from '@/components/MarkFeaturedUnlisted/hooks/useMarkFeaturedUnlisted';
import MarkFeatured from '@/components/MarkFeaturedUnlisted/MarkFeatured/MarkFeatured';
import MarkUnlisted from '@/components/MarkFeaturedUnlisted/MarkUnlisted/MarkUnlisted';
import RelativeBreadcrumbs from '@/components/RelativeBreadcrumbs/RelativeBreadcrumbs';
import UserAvatar from '@/components/UserAvatar/UserAvatar';
import { VISIBILITY } from '@/constants/contentTypes';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { LiteratureList } from '@/services/backend/types';

type ListCardProps = {
    list: LiteratureList;
    showBadge?: boolean;
    showCurationFlags?: boolean;
    renderCoins?: boolean;
};

const ListCard: FC<ListCardProps> = ({ list, showBadge = false, showCurationFlags = true, renderCoins = true }) => {
    const { isFeatured, isUnlisted, handleChangeStatus } = useMarkFeaturedUnlisted({
        resourceId: list.id,
        unlisted: list?.visibility === VISIBILITY.UNLISTED,
        featured: list?.visibility === VISIBILITY.FEATURED,
    });

    return (
        <div className={`list-group-item flex flex-wrap py-4 pr-6 ${showCurationFlags ? 'pl-4' : 'pl-6'}`}>
            <div className="flex w-full p-0 md:w-9/12 md:shrink-0 md:grow-0 md:basis-9/12 md:max-w-9/12">
                {renderCoins && <Coins item={list} />}
                {showCurationFlags && (
                    <div className="flex w-[25px] shrink-0 flex-col">
                        <div>
                            <MarkFeatured size="sm" featured={isFeatured} handleChangeStatus={handleChangeStatus} />
                        </div>
                        <div>
                            <MarkUnlisted size="sm" unlisted={isUnlisted} handleChangeStatus={handleChangeStatus} />
                        </div>
                    </div>
                )}
                <div className="flex grow flex-col">
                    <div className="mb-2">
                        <Link href={reverse(ROUTES.LIST, { id: list.id })}>{list.title}</Link>
                        {showBadge && (
                            <span className="ml-2 inline-block align-middle">
                                <Chip color="accent" variant="primary" size="sm">
                                    List
                                </Chip>
                            </span>
                        )}
                    </div>
                    <div className="mb-1">
                        <small>
                            <Authors authors={list.authors} />
                            {list.created_at && (
                                <>
                                    <FontAwesomeIcon size="sm" icon={faCalendar} className="ml-1 mr-1 text-muted" />{' '}
                                    {dayjs(list.created_at).format('DD-MM-YYYY')}
                                </>
                            )}
                        </small>
                    </div>
                    {list.versions?.published?.length > 1 && (
                        <small className="mt-2 block">
                            All versions:{' '}
                            {list.versions?.published.map((version, index) => (
                                <span key={version.id}>
                                    <Tooltip>
                                        <Tooltip.Trigger className="inline">
                                            <Link href={reverse(ROUTES.LIST, { id: version.id })}>
                                                Version {(list.versions.published?.length ?? 0) - index}
                                            </Link>
                                        </Tooltip.Trigger>
                                        <Tooltip.Content>{version.changelog ? version.changelog : 'No changelog title'}</Tooltip.Content>
                                    </Tooltip>{' '}
                                    {index < list.versions.published.length - 1 && ' • '}
                                </span>
                            ))}
                        </small>
                    )}
                </div>
            </div>
            <div className="flex w-full flex-col items-end p-0 md:w-3/12 md:shrink-0 md:grow-0 md:basis-3/12 md:max-w-3/12">
                <div className="mb-1 grow">
                    <div className="hidden items-end justify-end md:flex">
                        <RelativeBreadcrumbs researchField={list.research_fields?.[0]} />
                    </div>
                </div>
                <UserAvatar userId={list?.created_by} />
            </div>
        </div>
    );
};

export default ListCard;
