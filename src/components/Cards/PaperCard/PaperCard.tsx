import { faCalendar, faFile } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import { reverse } from 'named-urls';
import Link from 'next/link';
import pluralize from 'pluralize';
import { ChangeEvent, FC } from 'react';
import { Input } from 'reactstrap';
import styled from 'styled-components';

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
import { CardBadge } from '@/components/styled';
import UserAvatar from '@/components/UserAvatar/UserAvatar';
import { VISIBILITY } from '@/constants/contentTypes';
import ROUTES from '@/constants/routes';
import { Paper, Resource } from '@/services/backend/types';

const PaperCardStyled = styled.div`
    &.selected {
        background: ${(props) => props.theme.bodyBg};
    }
`;

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
        <PaperCardStyled
            className={`${isListGroupItem ? 'list-group-item' : ''} d-flex pe-4 ${showActionButtons ? ' ps-3  ' : ' ps-4  '} ${
                selected ? 'selected' : ''
            } py-3`}
            style={{ flexWrap: 'wrap' }}
        >
            <div className="col-md-9 d-flex p-0">
                {renderCoins && <Coins item={paper} />}
                {showActionButtons && (
                    <div className="d-flex flex-column flex-shrink-0" style={{ width: '25px' }}>
                        {selectable && (
                            <div>
                                <Input type="checkbox" id={`${paper.id}input`} onChange={onSelect} checked={selected} />
                            </div>
                        )}
                        {!selectable && showAddToComparison && !!paper.contributions?.length && (
                            <div>
                                <AddToComparison paper={paper} />
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
                <div className="d-flex flex-column flex-grow-1">
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
                            <div className="d-inline-block ms-2">
                                <CardBadge color="primary">Paper</CardBadge>
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="d-inline-block d-md-none mt-1 me-1">
                            {showBreadcrumbs && <RelativeBreadcrumbs researchField={paper.research_fields?.[0]} />}
                        </div>
                    </div>
                    <div className="mb-1">
                        <small>
                            {showContributionCount && (
                                <div className="d-inline-block me-1">
                                    <FontAwesomeIcon size="sm" icon={faFile} className="me-1" />
                                    {pluralize('contribution', paper.contributions?.length, true)}
                                </div>
                            )}
                            <Authors authors={paper.authors} />
                            {(paper.publication_info?.published_month || paper.publication_info?.published_year) && (
                                <FontAwesomeIcon size="sm" icon={faCalendar} className="ms-2 me-1" />
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
            <div className="col-md-3 d-flex align-items-end flex-column p-0">
                <div className="flex-grow-1 mb-1">
                    <div className="d-none d-md-flex align-items-end justify-content-end">
                        {showBreadcrumbs && <RelativeBreadcrumbs researchField={paper.research_fields?.[0]} />}
                    </div>
                </div>
                {showCreator && <UserAvatar userId={paper.created_by} />}
            </div>
            {paths && paths?.length > 0 && (
                <div className={`${showActionButtons ? 'ps-4' : 'ps-5'} mb-1`}>
                    <small>
                        <Paths paths={paths} />
                    </small>
                </div>
            )}
        </PaperCardStyled>
    );
};

export default PaperCard;
