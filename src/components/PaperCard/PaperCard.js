import { Input } from 'reactstrap';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import ROUTES from 'constants/routes.js';
import AddToComparison from 'components/PaperCard/AddToComparison';
import UserAvatar from 'components/UserAvatar/UserAvatar';
import MarkFeatured from 'components/MarkFeaturedUnlisted/MarkFeatured/MarkFeatured';
import MarkUnlisted from 'components/MarkFeaturedUnlisted/MarkUnlisted/MarkUnlisted';
import useMarkFeaturedUnlisted from 'components/MarkFeaturedUnlisted/hooks/useMarkFeaturedUnlisted';
import RelativeBreadcrumbs from 'components/RelativeBreadcrumbs/RelativeBreadcrumbs';
import { CardBadge } from 'components/styled';
import ContentLoader from 'react-content-loader';
import Authors from './Authors';
import PropTypes from 'prop-types';
import moment from 'moment';
import pluralize from 'pluralize';

const PaperCardStyled = styled.div`
    &.selected {
        background: ${props => props.theme.bodyBg};
    }
`;

const PaperCard = props => {
    const showActionButtons = props.showAddToComparison || props.selectable || props.showCurationFlags;
    const { isFeatured, isUnlisted, handleChangeStatus } = useMarkFeaturedUnlisted({
        resourceId: props.paper.id,
        unlisted: props.paper?.unlisted,
        featured: props.paper?.featured
    });

    return (
        <PaperCardStyled
            className={`${props.isListGroupItem ? 'list-group-item' : ''} d-flex pe-4 ${showActionButtons ? ' ps-3  ' : ' ps-4  '} ${
                props.selected ? 'selected' : ''
            } py-3`}
            style={{ flexWrap: 'wrap' }}
        >
            <div className="col-md-9 d-flex p-0">
                {showActionButtons && (
                    <div className="d-flex flex-column flex-shrink-0" style={{ width: '25px' }}>
                        {props.selectable && (
                            <div>
                                <Input type="checkbox" id={props.paper.id + 'input'} onChange={props.onSelect} checked={props.selected} />
                            </div>
                        )}
                        {!props.selectable && props.showAddToComparison && !!props.paper.contributions?.length && (
                            <div>
                                <AddToComparison paper={props.paper} contributionId={props.contribution?.id} />
                            </div>
                        )}
                        {props.showCurationFlags && (
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
                            target={props.linkTarget ? props.linkTarget : undefined}
                            to={
                                props.route ||
                                reverse(ROUTES.VIEW_PAPER, { resourceId: props.paper.id, contributionId: props.contribution?.id ?? undefined })
                            }
                        >
                            {props.paper.title ? props.paper.title : <em>No title</em>}
                        </Link>
                        {props.contribution && <span className="text-muted"> - {props.contribution.title}</span>}
                        {props.variant === 'list' && props.paper.contributions?.length > 0 && (
                            <div className="d-inline-block ms-2">
                                <CardBadge color="primary">{pluralize('contribution', props.paper.contributions?.length, true)}</CardBadge>
                            </div>
                        )}
                        {props.showBadge && (
                            <div className="d-inline-block ms-2">
                                <CardBadge color="primary">Paper</CardBadge>
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="d-inline-block d-md-none mt-1 me-1">
                            {props.showBreadcrumbs && <RelativeBreadcrumbs researchField={props.paper.researchField} />}
                        </div>
                    </div>
                    {/*Show Loading Dynamic data indicator if we are loading */}
                    {props.paper.isLoading && (
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
                            <Authors authors={props.paper.authors} />
                            {(props.paper.publicationMonth || props.paper.publicationYear) && (
                                <Icon size="sm" icon={faCalendar} className="ms-2 me-1" />
                            )}
                            {props.paper.publicationMonth && props.paper.publicationMonth.label > 0
                                ? moment(props.paper.publicationMonth.label, 'M').format('MMMM')
                                : ''}{' '}
                            {props.paper.publicationYear?.label ?? null}
                        </small>
                        {props.description?.label && (
                            <p className="mb-0 mt-1 w-100 pt-0" style={{ lineHeight: 1.2, whiteSpace: 'pre-line' }}>
                                <small className="text-muted">{props.description?.label}</small>
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="col-md-3 d-flex align-items-end flex-column p-0">
                <div className="flex-grow-1 mb-1">
                    <div className="d-none d-md-flex align-items-end justify-content-end">
                        {props.showBreadcrumbs && <RelativeBreadcrumbs researchField={props.paper.researchField} />}
                    </div>
                </div>
                {props.showCreator && <UserAvatar userId={props.paper.created_by} />}
            </div>
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
            label: PropTypes.string
        }),
        contributions: PropTypes.array,
        created_by: PropTypes.string,
        featured: PropTypes.bool,
        unlisted: PropTypes.bool,
        isLoading: PropTypes.bool
    }).isRequired,
    contribution: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string
    }),
    selectable: PropTypes.bool,
    selected: PropTypes.bool,
    showBreadcrumbs: PropTypes.bool.isRequired,
    showCreator: PropTypes.bool.isRequired,
    showAddToComparison: PropTypes.bool.isRequired,
    showBadge: PropTypes.bool.isRequired,
    showCurationFlags: PropTypes.bool.isRequired,
    onSelect: PropTypes.func,
    isListGroupItem: PropTypes.bool.isRequired,
    description: PropTypes.object,
    linkTarget: PropTypes.string,
    variant: PropTypes.string,
    route: PropTypes.string
};

PaperCard.defaultProps = {
    selectable: false,
    linkTarget: '_self',
    selected: false,
    showBreadcrumbs: true,
    showCreator: true,
    showAddToComparison: true,
    showBadge: false,
    showCurationFlags: true,
    isListGroupItem: true,
    onChange: () => {},
    description: null,
    variant: 'default',
    route: null
};

export default PaperCard;
