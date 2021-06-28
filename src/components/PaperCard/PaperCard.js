import { CustomInput } from 'reactstrap';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import ROUTES from 'constants/routes.js';
import AddToComparison from 'components/PaperCard/AddToComparison';
import UserAvatar from 'components/UserAvatar/UserAvatar';
import MarkFeatured from 'components/MarkFeatured/MarkFeatured';
import MarkUnlisted from 'components/MarkUnlisted/MarkUnlisted';
import RelativeBreadcrumbs from 'components/RelativeBreadcrumbs/RelativeBreadcrumbs';
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

const PaperCard = props => {
    const comparison = useSelector(state => state.viewPaper.comparison);

    return (
        <PaperCardStyled
            className={
                'list-group-item list-group-item-action pr-2 ' +
                (props.contribution && comparison.allIds.includes(props.contribution.id) ? 'selected' : '')
            }
        >
            <div className="row">
                <div className="col-9 d-flex">
                    {props.selectable && (
                        <div style={{ marginRight: -10 }} className="pr-2">
                            <CustomInput type="checkbox" onChange={props.onSelect} checked={props.selected} id={props.paper.id + 'input'} />
                        </div>
                    )}
                    <div className="d-block">
                        {props.contribution && (
                            <>
                                <Link to={reverse(ROUTES.VIEW_PAPER, { resourceId: props.paper.id, contributionId: props.contribution.id })}>
                                    {props.paper.title ? props.paper.title : <em>No title</em>}
                                </Link>{' '}
                                - <span className="text-muted">{props.contribution.title}</span>
                            </>
                        )}
                        {!props.contribution && (
                            <Link to={reverse(ROUTES.VIEW_PAPER, { resourceId: props.paper.id })}>
                                {props.paper.title ? props.paper.title : <em>No title</em>}
                            </Link>
                        )}
                        <div className="d-inline-block ml-1">
                            <MarkFeatured size="sm" resourceId={props.paper.id} featured={props.paper.featured} />
                        </div>
                        <div className="d-inline-block ml-1">
                            <MarkUnlisted size="sm" resourceId={props.paper.id} unlisted={props.paper?.unlisted} />
                        </div>
                        <br />
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
                        <div className="d-flex d-md-none mt-1">
                            {props.showBreadcrumbs && <RelativeBreadcrumbs researchField={props.paper.researchField} />}
                            {props.showAddToComparison && (
                                <div className="d-flex ml-1 text-left">
                                    <AddToComparison paper={props.paper} contributionId={props.contribution?.id} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="col-md-3 text-right d-flex align-items-end flex-column">
                    <div style={{ flex: 1 }}>
                        <div className="d-none d-md-flex align-items-center">
                            {props.showBreadcrumbs && <RelativeBreadcrumbs researchField={props.paper.researchField} />}
                            {props.showAddToComparison && (
                                <div className="d-flex ml-1 mb-2 text-left">
                                    <AddToComparison paper={props.paper} contributionId={props.contribution?.id} />
                                </div>
                            )}
                        </div>
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
        created_by: PropTypes.string,
        featured: PropTypes.bool,
        unlisted: PropTypes.bool
    }).isRequired,
    contribution: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string
    }),
    selectable: PropTypes.bool,
    selected: PropTypes.bool,
    showBreadcrumbs: PropTypes.bool.isRequired,
    showAddToComparison: PropTypes.bool.isRequired,
    onSelect: PropTypes.func
};

PaperCard.defaultProps = {
    selectable: false,
    selected: false,
    showBreadcrumbs: true,
    showAddToComparison: true,
    onChange: () => {}
};

export default PaperCard;
