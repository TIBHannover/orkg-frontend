import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import Authors from 'components/Cards/PaperCard/Authors';
import useCardData from 'components/Cards/hooks/useCardData';
import MarkFeatured from 'components/MarkFeaturedUnlisted/MarkFeatured/MarkFeatured';
import MarkUnlisted from 'components/MarkFeaturedUnlisted/MarkUnlisted/MarkUnlisted';
import useMarkFeaturedUnlisted from 'components/MarkFeaturedUnlisted/hooks/useMarkFeaturedUnlisted';
import Link from 'next/link';
import RelativeBreadcrumbs from 'components/RelativeBreadcrumbs/RelativeBreadcrumbs';
import UserAvatar from 'components/UserAvatar/UserAvatar';
import { CardBadge } from 'components/styled';
import { VISIBILITY } from 'constants/contentTypes';
import ROUTES from 'constants/routes';
import moment from 'moment';
import { reverse } from 'named-urls';
import { FC } from 'react';
import { LiteratureList } from 'services/backend/types';
import styled from 'styled-components';

const CardStyled = styled('div')<{ rounded?: string }>`
    &:last-child {
        border-bottom-right-radius: ${(props) => (props.rounded === 'true' ? '0 !important' : '')};
    }
`;

type ListCardProps = {
    list: LiteratureList;
    showBadge?: boolean;
    showCurationFlags?: boolean;
};

const ListCard: FC<ListCardProps> = ({ list, showBadge = false, showCurationFlags = true }) => {
    // the useCardData can be removed as soon as the convertReviewToNewFormat function is not used anymore to transform review data,
    // this because the new 'review' variable already has the field and authors included
    const { researchField, authors } = useCardData({
        id: list.id,
        // @ts-expect-error
        initResearchField: list.research_fields?.[0],
        initAuthors: list.authors,
        isList: true,
    });

    const { isFeatured, isUnlisted, handleChangeStatus } = useMarkFeaturedUnlisted({
        resourceId: list.id,
        unlisted: list?.visibility === VISIBILITY.UNLISTED,
        featured: list?.visibility === VISIBILITY.FEATURED,
    });

    return (
        <CardStyled style={{ flexWrap: 'wrap' }} className={`list-group-item d-flex py-3 pe-4 ${showCurationFlags ? ' ps-3  ' : ' ps-4  '}`}>
            <div className="col-md-9 d-flex p-0">
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
                            <Authors authors={authors} />
                            {list.created_at && (
                                <>
                                    <Icon size="sm" icon={faCalendar} className="ms-1 me-1" /> {moment(list.created_at).format('DD-MM-YYYY')}
                                </>
                            )}
                        </small>
                    </div>
                    {list.versions?.published?.length > 1 && (
                        <small>
                            All versions:{' '}
                            {list.versions?.published.map((version, index) => (
                                <span key={version.id}>
                                    <Tippy content={version.changelog ? version.changelog : 'No changelog title'}>
                                        <Link href={reverse(ROUTES.LIST, { id: version.id })}>
                                            Version {(list.versions.published?.length ?? 0) - index}
                                        </Link>
                                    </Tippy>{' '}
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
                        <RelativeBreadcrumbs researchField={researchField} />
                    </div>
                </div>
                <UserAvatar userId={list?.created_by} />
            </div>
        </CardStyled>
    );
};

export default ListCard;
