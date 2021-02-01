import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { ListGroup, ListGroupItem, Button } from 'reactstrap';
import ContentLoader from 'react-content-loader';
import { Link, withRouter } from 'react-router-dom';
import ROUTES from 'constants/routes';
import { PREDICATE_TYPE_ID, RESOURCE_TYPE_ID } from 'constants/misc';
import { CLASSES } from 'constants/graphSettings';
import { reverse } from 'named-urls';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import moment from 'moment';

const StyledLoadMoreButton = styled.div`
    padding-top: 0;
    & button {
        cursor: pointer;
        border: 1px solid rgba(0, 0, 0, 0.125);
        border-top: 0;
        border-top-right-radius: 0;
        border-top-left-radius: 0;
        border-bottom-right-radius: 6px;
        border-bottom-left-radius: 6px;
    }
    &.action:hover button {
        z-index: 1;
        color: #495057;
        text-decoration: underline;
        background-color: #f8f9fa;
    }
`;

const StyledListGroupItem = styled(ListGroupItem)`
    overflow-wrap: break-word;
    word-break: break-all;

    &:last-child {
        border-bottom-right-radius: ${props => (props.rounded === 'true' ? '0 !important' : '')};
    }
`;

const Results = props => {
    const getResourceLink = (filterClass, resourceId) => {
        let link = '';

        switch (filterClass) {
            case CLASSES.PAPER: {
                link = reverse(ROUTES.VIEW_PAPER, { resourceId: resourceId });
                break;
            }
            case CLASSES.PROBLEM: {
                link = reverse(ROUTES.RESEARCH_PROBLEM, { researchProblemId: resourceId });
                break;
            }
            case CLASSES.AUTHOR: {
                link = reverse(ROUTES.AUTHOR_PAGE, { authorId: resourceId });
                break;
            }
            case CLASSES.COMPARISON: {
                link = reverse(ROUTES.COMPARISON, { comparisonId: resourceId });
                break;
            }
            case CLASSES.VENUE: {
                link = reverse(ROUTES.VENUE_PAGE, { venueId: resourceId });
                break;
            }
            case CLASSES.CONTRIBUTION_TEMPLATE: {
                link = reverse(ROUTES.CONTRIBUTION_TEMPLATE, { id: resourceId });
                break;
            }
            case RESOURCE_TYPE_ID: {
                link = reverse(ROUTES.RESOURCE, { id: resourceId });
                break;
            }
            case PREDICATE_TYPE_ID: {
                link = reverse(ROUTES.PREDICATE, { id: resourceId });
                break;
            }
            default: {
                link = reverse(ROUTES.RESOURCE, { id: resourceId });
                break;
            }
        }

        return link;
    };

    return (
        <div>
            {props.loading && (
                <ContentLoader
                    height="100%"
                    width="100%"
                    viewBox="0 0 100 25"
                    style={{ width: '100% !important' }}
                    speed={2}
                    backgroundColor="#f3f3f3"
                    foregroundColor="#ecebeb"
                >
                    <rect x="0" y="0" width="50" height="3" />
                    <rect x="0" y="5" width="100%" height="3" />
                    <rect x="0" y="10" width="100%" height="3" />
                    <rect x="0" y="15" width="100%" height="3" />
                    <rect x="0" y="20" width="100%" height="3" />
                </ContentLoader>
            )}

            {!props.loading && props.items.length === 0 && props.showNoResultsMessage && (
                <div>
                    <h2 className="h5">{props.label}</h2>
                    <div className="text-center mt-4 mb-4">There are no results, please try a different search term</div>
                </div>
            )}

            {props.items.length > 0 && (
                <div>
                    <h2 className="h5">{props.label}</h2>
                    <div className="mb-3">
                        <ListGroup>
                            {props.items.map((item, index) => {
                                return (
                                    <StyledListGroupItem rounded={props.hasNextPage.toString()} action key={`result-${index}`} className="pt-1 pb-1">
                                        <Link to={getResourceLink(props.class, item.id)}>{item.label}</Link>
                                        {item.classes && item.classes.includes(CLASSES.COMPARISON) && (
                                            <div>
                                                <small>
                                                    <i className="text-muted">
                                                        <Icon size="sm" icon={faCalendar} className="mr-1" />{' '}
                                                        {moment(item.created_at).format('DD MMMM YYYY')}
                                                    </i>
                                                </small>
                                            </div>
                                        )}
                                    </StyledListGroupItem>
                                );
                            })}
                        </ListGroup>
                        {!props.loading && props.hasNextPage && (
                            <StyledLoadMoreButton className="text-right action">
                                <Button color="link" size="sm" onClick={props.loadMore}>
                                    + Load more
                                </Button>
                            </StyledLoadMoreButton>
                        )}
                        {props.loading && props.hasNextPage && (
                            <StyledLoadMoreButton className="text-right action">
                                <Button color="link" size="sm" onClick={props.loadMore}>
                                    Loading...
                                </Button>
                            </StyledLoadMoreButton>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

Results.propTypes = {
    loading: PropTypes.bool.isRequired,
    label: PropTypes.string.isRequired,
    class: PropTypes.string.isRequired,
    items: PropTypes.array.isRequired,
    loadMore: PropTypes.func.isRequired,
    hasNextPage: PropTypes.bool.isRequired,
    showNoResultsMessage: PropTypes.bool.isRequired
};

export default withRouter(Results);
