import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { FC } from 'react';
import styled from 'styled-components';

import Authors from '@/components/Cards/PaperCard/Authors';
import Coins from '@/components/Coins/Coins';
import Tooltip from '@/components/FloatingUI/Tooltip';
import useMarkFeaturedUnlisted from '@/components/MarkFeaturedUnlisted/hooks/useMarkFeaturedUnlisted';
import MarkFeatured from '@/components/MarkFeaturedUnlisted/MarkFeatured/MarkFeatured';
import MarkUnlisted from '@/components/MarkFeaturedUnlisted/MarkUnlisted/MarkUnlisted';
import RelativeBreadcrumbs from '@/components/RelativeBreadcrumbs/RelativeBreadcrumbs';
import { CardBadge } from '@/components/styled';
import UserAvatar from '@/components/UserAvatar/UserAvatar';
import { VISIBILITY } from '@/constants/contentTypes';
import ROUTES from '@/constants/routes';
import { LiteratureList } from '@/services/backend/types';

const CardStyled = styled('div')<{ rounded?: string }>`
    &:last-child {
        border-bottom-right-radius: ${(props) => (props.rounded === 'true' ? '0 !important' : '')};
    }
`;

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
        <CardStyled style={{ flexWrap: 'wrap' }} className={`list-group-item d-flex py-3 pe-4 ${showCurationFlags ? ' ps-3  ' : ' ps-4  '}`}>
            <div className="col-md-9 d-flex p-0">
                {renderCoins && <Coins item={list} />}
                {showCurationFlags && (
                    <div className="d-flex flex-column flex-shrink-0" style={{ width: '25px' }}>
                        <div>
                            <MarkFeatured size="sm" featured={isFeatured} handleChangeStatus={handleChangeStatus} />
                        </div>
                        <div>
                            <MarkUnlisted size="sm" unlisted={isUnlisted} handleChangeStatus={handleChangeStatus} />
                        </div>
                    </div>
                )}
                <div className="d-flex flex-column flex-grow-1">
                    <div className="mb-2">
                        <Link href={reverse(ROUTES.LIST, { id: list.id })}>{list.title}</Link>
                        {showBadge && (
                            <div className="d-inline-block ms-2">
                                <CardBadge color="primary">List</CardBadge>
                            </div>
                        )}
                    </div>
                    <div className="mb-1">
                        <small>
                            <Authors authors={list.authors} />
                            {list.created_at && (
                                <>
                                    <FontAwesomeIcon size="sm" icon={faCalendar} className="ms-1 me-1" />{' '}
                                    {dayjs(list.created_at).format('DD-MM-YYYY')}
                                </>
                            )}
                        </small>
                    </div>
                    {list.versions?.published?.length > 1 && (
                        <small>
                            All versions:{' '}
                            {list.versions?.published.map((version, index) => (
                                <span key={version.id}>
                                    <Tooltip content={version.changelog ? version.changelog : 'No changelog title'}>
                                        <Link href={reverse(ROUTES.LIST, { id: version.id })}>
                                            Version {(list.versions.published?.length ?? 0) - index}
                                        </Link>
                                    </Tooltip>{' '}
                                    {index < list.versions.published.length - 1 && ' • '}
                                </span>
                            ))}
                        </small>
                    )}
                </div>
            </div>
            <div className="col-md-3 d-flex align-items-end flex-column p-0">
                <div className="flex-grow-1 mb-1">
                    <div className="d-none d-md-flex align-items-end justify-content-end">
                        <RelativeBreadcrumbs researchField={list.research_fields?.[0]} />
                    </div>
                </div>
                <UserAvatar userId={list?.created_by} />
            </div>
        </CardStyled>
    );
};

export default ListCard;
