import Link from 'components/NextJsMigration/Link';
import { Input } from 'reactstrap';
import { reverse } from 'named-urls';
import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCalendar, faFile } from '@fortawesome/free-solid-svg-icons';
import ROUTES from 'constants/routes.js';
import AddToComparison from 'components/Cards/PaperCard/AddToComparison';
import UserAvatar from 'components/UserAvatar/UserAvatar';
import MarkFeatured from 'components/MarkFeaturedUnlisted/MarkFeatured/MarkFeatured';
import MarkUnlisted from 'components/MarkFeaturedUnlisted/MarkUnlisted/MarkUnlisted';
import useMarkFeaturedUnlisted from 'components/MarkFeaturedUnlisted/hooks/useMarkFeaturedUnlisted';
import RelativeBreadcrumbs from 'components/RelativeBreadcrumbs/RelativeBreadcrumbs';
import { CardBadge } from 'components/styled';
import ContentLoader from 'react-content-loader';
import PropTypes from 'prop-types';
import moment from 'moment';
import pluralize from 'pluralize';
import Authors from 'components/Cards/PaperCard/Authors';
import Paths from 'components/Cards/PaperCard/Paths';

const PaperCardStyled = styled.div`
    &.selected {
        background: ${props => props.theme.bodyBg};
    }
`;

const PaperCard = ({
    paper,
    contribution,
    onSelect,
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
        unlisted: paper?.unlisted,
        featured: paper?.featured,
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
                                <AddToComparison paper={paper} contributionId={contribution?.id} />
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
                                reverse(contribution?.id ? ROUTES.VIEW_PAPER_CONTRIBUTION : ROUTES.VIEW_PAPER, {
                                    resourceId: paper.id,
                                    contributionId: contribution?.id ?? undefined,
                                })
                            }
                        >
                            {paper.title ? paper.title : <em>No title</em>}
                        </Link>
                        {contribution && <span className="text-muted"> - {contribution.title}</span>}
                        {showBadge && (
                            <div className="d-inline-block ms-2">
                                <CardBadge color="primary">Paper</CardBadge>
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="d-inline-block d-md-none mt-1 me-1">
                            {showBreadcrumbs && <RelativeBreadcrumbs researchField={paper.researchField} />}
                        </div>
                    </div>
                    {/* Show Loading Dynamic data indicator if we are loading */}
                    {paper.isLoading && (
                        <div>
                            <span>Loading</span>
                            <ContentLoader
                                style={{ marginTop: '-8px', width: '8% !important' }}
                                height={30}
                                width="8%"
                                viewBox="0 0 100 30"
                                speed={2}
                                backgroundColor="#f3f3f3"
                                foregroundColor="#ccc"
                            >
                                <circle cx="6" cy="18" r="4" />
                                <circle cx="16" cy="18" r="4" />
                                <circle cx="26" cy="18" r="4" />
                            </ContentLoader>
                        </div>
                    )}
                    <div className="mb-1">
                        <small>
                            {showContributionCount && (
                                <div className="d-inline-block me-1">
                                    <Icon size="sm" icon={faFile} className="me-1" />
                                    {pluralize('contribution', paper.contributions?.length, true)}
                                </div>
                            )}
                            <Authors authors={paper.authors} />
                            {(paper.publicationMonth || paper.publicationYear) && <Icon size="sm" icon={faCalendar} className="ms-2 me-1" />}
                            {paper.publicationMonth && paper.publicationMonth.label > 0
                                ? moment(paper.publicationMonth.label, 'M').format('MMMM')
                                : ''}{' '}
                            {paper.publicationYear?.label ?? null}
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
                        {showBreadcrumbs && <RelativeBreadcrumbs researchField={paper.researchField} />}
                    </div>
                </div>
                {showCreator && <UserAvatar userId={paper.created_by} />}
            </div>
            {paths?.length > 0 && (
                <div className={`${showActionButtons ? 'ps-4' : 'ps-5'} mb-1`}>
                    <small>
                        <Paths paths={paths} />
                    </small>
                </div>
            )}
        </PaperCardStyled>
    );
};

PaperCard.propTypes = {
    paper: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string,
        authors: PropTypes.array,
        publicationMonth: PropTypes.object,
        publicationYear: PropTypes.object,
        researchField: PropTypes.shape({
            id: PropTypes.string.isRequired,
            label: PropTypes.string,
        }),
        contributions: PropTypes.array,
        created_by: PropTypes.string,
        featured: PropTypes.bool,
        unlisted: PropTypes.bool,
        isLoading: PropTypes.bool,
    }).isRequired,
    contribution: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string,
    }),
    selectable: PropTypes.bool,
    selected: PropTypes.bool,
    showBreadcrumbs: PropTypes.bool,
    showCreator: PropTypes.bool,
    showAddToComparison: PropTypes.bool,
    showBadge: PropTypes.bool,
    showCurationFlags: PropTypes.bool,
    onSelect: PropTypes.func,
    isListGroupItem: PropTypes.bool,
    description: PropTypes.object,
    linkTarget: PropTypes.string,
    showContributionCount: PropTypes.bool,
    route: PropTypes.string,
    paths: PropTypes.array,
};

export default PaperCard;
