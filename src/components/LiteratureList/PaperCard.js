import { CustomInput } from 'reactstrap';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import ROUTES from 'constants/routes.js';
import AddToComparison from 'components/PaperCard/AddToComparison';
import UserAvatar from 'components/UserAvatar/UserAvatar';
import RelativeBreadcrumbs from 'components/RelativeBreadcrumbs/RelativeBreadcrumbs';
import { CardBadge } from 'components/styled';
import ContentLoader from 'react-content-loader';
import Authors from 'components/PaperCard/Authors';
import PropTypes from 'prop-types';
import moment from 'moment';

const PaperCardStyled = styled.div`
    &.selected {
        background: ${props => props.theme.bodyBg};
    }
`;

const PaperCard = props => {
    const showActionButtons = props.showAddToComparison || props.selectable;

    return (
        <PaperCardStyled className={`list-group-item d-flex pr-3 ${showActionButtons ? ' pl-2  ' : ' pl-3  '} ${props.selected ? 'selected' : ''}`}>
            <div className="col-md-9 d-flex p-0">
                {showActionButtons && (
                    <div className="d-flex flex-column flex-shrink-0" style={{ width: '25px' }}>
                        {props.selectable && (
                            <div>
                                <CustomInput type="checkbox" id={props.paper.id + 'input'} onChange={props.onSelect} checked={props.selected} />
                            </div>
                        )}
                        {!props.selectable && props.showAddToComparison && !!props.paper.contributions?.length && (
                            <div>
                                <AddToComparison paper={props.paper} contributionId={props.contribution?.id} />
                            </div>
                        )}
                    </div>
                )}
                <div className="d-flex flex-column flex-grow-1">
                    <div>
                        <Link
                            target="_blank"
                            to={reverse(ROUTES.VIEW_PAPER, { resourceId: props.paper.id, contributionId: props.contribution?.id ?? undefined })}
                        >
                            {props.paper.title ? props.paper.title : <em>No title</em>}
                        </Link>
                        {props.contribution && <span className="text-muted"> - {props.contribution.title}</span>}
                        {props.showBadge && (
                            <div className="d-inline-block ml-2">
                                <CardBadge color="primary">Paper</CardBadge>
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="d-inline-block d-md-none mt-1 mr-1">
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
                    <div>
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
                        {props.paper.description?.label && (
                            <p className="mb-0 mt-1 w-100 pt-0 border-top" style={{ lineHeight: 1.2 }}>
                                <small className="text-muted">{props.paper.description?.label}</small>
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="col-md-3 d-flex align-items-end flex-column p-0">
                <div className="flex-grow-1 mb-1">
                    <div className="d-none d-md-flex align-items-end justify-content-end">
                        <RelativeBreadcrumbs researchField={props.paper.researchField} />
                    </div>
                </div>
                <UserAvatar userId={props.paper.created_by} />
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
        isLoading: PropTypes.bool,
        description: PropTypes.string
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
    onSelect: PropTypes.func
};

PaperCard.defaultProps = {
    selectable: false,
    selected: false,
    showBreadcrumbs: true,
    showAddToComparison: true,
    showBadge: false,
    onChange: () => {}
};

export default PaperCard;
