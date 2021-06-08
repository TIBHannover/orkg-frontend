import { CustomInput } from 'reactstrap';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import ROUTES from 'constants/routes.js';
import AddToComparison from 'components/ViewPaper/AddToComparison';
import UserAvatar from 'components/UserAvatar/UserAvatar';
import FeaturedMark from 'components/FeaturedMark/FeaturedMark';
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
                            <FeaturedMark size="sm" resourceId={props.paper.id} />
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
                        {props.showBreadcrumbs && (
                            <div className="d-block d-md-none mt-1">
                                <RelativeBreadcrumbs researchField={props.paper.researchField} />
                            </div>
                        )}
                    </div>
                </div>
                <div className="col-md-3 text-right d-flex align-items-end" style={{ flexDirection: 'column' }}>
                    <div style={{ flex: 1 }}>
                        {props.showBreadcrumbs && (
                            <div className="d-none d-md-block">
                                <RelativeBreadcrumbs researchField={props.paper.researchField} />
                            </div>
                        )}

                        {props.contribution && (
                            <div className="options mr-2">
                                <AddToComparison
                                    contributionId={props.contribution.id}
                                    paperId={props.paper.id}
                                    paperTitle={props.paper.title}
                                    contributionTitle={props.contribution.title}
                                />
                            </div>
                        )}
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
        created_by: PropTypes.string
    }).isRequired,
    contribution: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string
    }),
    selectable: PropTypes.bool,
    selected: PropTypes.bool,
    showBreadcrumbs: PropTypes.bool.isRequired,
    onSelect: PropTypes.func
};

PaperCard.defaultProps = {
    selectable: false,
    selected: false,
    showBreadcrumbs: true,
    onChange: () => {}
};

export default PaperCard;
