import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Tooltip } from '@heroui/react';
import dayjs from 'dayjs';
import Link from 'next/link';
import { FC } from 'react';

import CardBadge from '@/components/Cards/CardBadge/CardBadge';
import CardColumns from '@/components/Cards/CardShell/CardColumns';
import CardShell from '@/components/Cards/CardShell/CardShell';
import MetadataRow from '@/components/Cards/CardShell/MetadataRow';
import Authors from '@/components/Cards/PaperCard/Authors';
import Coins from '@/components/Coins/Coins';
import useMarkFeaturedUnlisted from '@/components/MarkFeaturedUnlisted/hooks/useMarkFeaturedUnlisted';
import MarkFeatured from '@/components/MarkFeaturedUnlisted/MarkFeatured/MarkFeatured';
import MarkUnlisted from '@/components/MarkFeaturedUnlisted/MarkUnlisted/MarkUnlisted';
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
        <CardShell>
            <CardColumns
                gutter={
                    showCurationFlags && (
                        <>
                            <MarkFeatured size="sm" featured={isFeatured} handleChangeStatus={handleChangeStatus} />
                            <MarkUnlisted size="sm" unlisted={isUnlisted} handleChangeStatus={handleChangeStatus} />
                        </>
                    )
                }
                researchField={list.research_fields?.[0]}
                createdBy={list?.created_by}
            >
                {renderCoins && <Coins item={list} />}
                <div className="mb-2">
                    <Link href={reverse(ROUTES.LIST, { id: list.id })}>{list.title}</Link>
                    {showBadge && (
                        <span className="ml-2 inline-block align-middle">
                            <CardBadge>List</CardBadge>
                        </span>
                    )}
                </div>
                <MetadataRow
                    className="mb-1"
                    items={[
                        !!list.authors?.length && { key: 'authors', node: <Authors authors={list.authors} /> },
                        !!list.created_at && {
                            key: 'created-at',
                            node: (
                                <span className="inline-flex items-center" title={`Created ${dayjs(list.created_at).format('DD MMMM YYYY')}`}>
                                    <FontAwesomeIcon size="sm" icon={faCalendar} className="me-1 text-muted" />
                                    {dayjs(list.created_at).format('DD MMM YYYY')}
                                </span>
                            ),
                        },
                    ]}
                />
                {list.versions?.published?.length > 1 && (
                    <div className="mt-2 text-sm">
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
                    </div>
                )}
            </CardColumns>
        </CardShell>
    );
};

export default ListCard;
