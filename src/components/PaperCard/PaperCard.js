import { CustomInput } from 'reactstrap';
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
import ContentLoader from 'react-content-loader';
import Authors from './Authors';
import PropTypes from 'prop-types';
import moment from 'moment';

const PaperCardStyled = styled.div`
    & .options {
        visibility: hidden;
    }

    &.selected {
        background: ${props => props.theme.bodyBg};
    }

    &:hover .options,
    &.selected .options {
        visibility: visible;
    }
`;

const CardBadge = styled.div`
    background: #fff;
    display: inline-block;
    color: ${props => props.theme.bodyColor};
    padding: 1px 5px;
    margin-right: 6px;
    font-size: 70%;
    border-radius: 4px;
    border: 1px ${props => props.theme.bodyColor} solid;
`;

const PaperCard = props => {
    const showActionButtons = props.showAddToComparison || props.selectable || props.showCurationFlags;
    const { isFeatured, isUnlisted, handleChangeStatus } = useMarkFeaturedUnlisted({
        resourceId: props.paper.id,
        unlisted: props.paper?.unlisted,
        featured: props.paper?.featured
    });

    return (
        <PaperCardStyled className={'list-group-item list-group-item-action d-flex pr-3 pl-3 ' + (props.selected ? 'selected' : '')}>
            {showActionButtons && (
                <div className="mr-1 d-flex flex-column" style={{ width: '25px' }}>
                    {props.selectable && (
                        <div>
                            <CustomInput type="checkbox" id={props.paper.id + 'input'} onChange={props.onSelect} checked={props.selected} />
                        </div>
                    )}
                    {!props.selectable && props.showAddToComparison && props.paper.contributions?.length && (
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
            <div className="d-flex flex-grow-1 flex-column">
                <div className="d-flex flex-grow-1 row">
                    <div className="d-block col-md-9">
                        <Link to={reverse(ROUTES.VIEW_PAPER, { resourceId: props.paper.id, contributionId: props.contribution?.id ?? undefined })}>
                            {props.paper.title ? props.paper.title : <em>No title</em>}
                        </Link>
                        {props.contribution && <span className="text-muted"> - {props.contribution.title}</span>}
                        <div>
                            {props.showBadge && <CardBadge color="primary">Paper</CardBadge>}
                            <div className="d-inline-block d-md-none mt-1 mr-1">
                                {props.showBreadcrumbs && <RelativeBreadcrumbs researchField={props.paper.researchField} />}
                            </div>
                        </div>
                    </div>

                    <div className="d-none d-md-flex col-md-3 justify-content-end">
                        {props.showBreadcrumbs && <RelativeBreadcrumbs researchField={props.paper.researchField} />}
                    </div>
                </div>
                <div className="d-flex mt-1">
                    <div className="d-block flex-grow-1">
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
                        <small>
                            <Authors authors={props.paper.authors} />
                            {(props.paper.publicationMonth || props.paper.publicationYear) && (
                                <Icon size="sm" icon={faCalendar} className="ml-2 mr-1" />
                            )}
                            {props.paper.publicationMonth && props.paper.publicationMonth.label > 0
                                ? moment(props.paper.publicationMonth.label, 'M').format('MMMM')
                                : ''}{' '}
                            {props.paper.publicationYear?.label ?? null}
                        </small>
                    </div>
                    <UserAvatar userId={props.paper.created_by} />
                </div>
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
    showAddToComparison: PropTypes.bool.isRequired,
    showBadge: PropTypes.bool.isRequired,
    showCurationFlags: PropTypes.bool.isRequired,
    onSelect: PropTypes.func
};

PaperCard.defaultProps = {
    selectable: false,
    selected: false,
    showBreadcrumbs: true,
    showAddToComparison: true,
    showBadge: false,
    showCurationFlags: true,
    onChange: () => {}
};

export default PaperCard;
