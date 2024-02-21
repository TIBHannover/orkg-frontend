import { faCalendar, faFile } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import AddToComparison from 'components/Cards/PaperCard/AddToComparison';
import Authors from 'components/Cards/PaperCard/Authors';
import Paths from 'components/Cards/PaperCard/Paths';
import MarkFeatured from 'components/MarkFeaturedUnlisted/MarkFeatured/MarkFeatured';
import MarkUnlisted from 'components/MarkFeaturedUnlisted/MarkUnlisted/MarkUnlisted';
import useMarkFeaturedUnlisted from 'components/MarkFeaturedUnlisted/hooks/useMarkFeaturedUnlisted';
import Link from 'components/NextJsMigration/Link';
import RelativeBreadcrumbs from 'components/RelativeBreadcrumbs/RelativeBreadcrumbs';
import UserAvatar from 'components/UserAvatar/UserAvatar';
import { CardBadge } from 'components/styled';
import { VISIBILITY } from 'constants/contentTypes';
import ROUTES from 'constants/routes.js';
import moment from 'moment';
import { reverse } from 'named-urls';
import pluralize from 'pluralize';
import { ChangeEvent, FC } from 'react';
import { Input } from 'reactstrap';
import { Paper } from 'services/backend/types';
import styled from 'styled-components';

const PaperCardStyled = styled.div`
    &.selected {
        background: ${props => props.theme.bodyBg};
    }
`;

type PaperCardType = {
    paper: Paper;
    onSelect?: (event: ChangeEvent<HTMLInputElement>) => void;
    paths?: string[];
    selectable?: boolean;
    linkTarget?: string;
    selected?: boolean;
    showBreadcrumbs?: boolean;
    showCreator?: boolean;
    showAddToComparison?: boolean;
    showBadge?: boolean;
    showCurationFlags?: boolean;
    isListGroupItem?: boolean;
    description?: { label: string };
    showContributionCount?: boolean;
    route?: string;
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
    showContributionCount = false,
    route = null,
}) => {
    const showActionButtons = showAddToComparison || selectable || showCurationFlags;
    const { isFeatured, isUnlisted, handleChangeStatus } = useMarkFeaturedUnlisted({
        resourceId: paper.id,
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
                        {/* @ts-expect-error */}
                        <Link
                            target={linkTarget || undefined}
                            href={
                                route ||
                                reverse(ROUTES.VIEW_PAPER, {
                                    resourceId: paper.id,
                                })
                            }
                        >
                            {paper.title ? paper.title : <em>No title</em>}
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
                                    <Icon size="sm" icon={faFile} className="me-1" />
                                    {pluralize('contribution', paper.contributions?.length, true)}
                                </div>
                            )}
                            <Authors authors={paper.authors} />
                            {(paper.publication_info?.published_month || paper.publication_info?.published_year) && (
                                <Icon size="sm" icon={faCalendar} className="ms-2 me-1" />
                            )}
                            {paper.publication_info?.published_month && paper.publication_info?.published_month > 0
                                ? moment(paper.publication_info?.published_month, 'M').format('MMMM')
                                : ''}{' '}
                            {paper.publication_info?.published_year ?? null}
                        </small>
                        {description?.label && (
                            <p className="mb-0 mt-1 w-100 pt-0" style={{ lineHeight: 1.2, whiteSpace: 'pre-line' }}>
                                <small className="text-muted">{description?.label}</small>
                            </p>
                        )}
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
