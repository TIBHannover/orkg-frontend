import React from 'react';
import { withRouter } from 'react-router-dom';
import { ListGroup, ListGroupItem } from 'reactstrap';
import ROUTES from '../../constants/routes.js';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import ContentLoader from 'react-content-loader';
import styled from 'styled-components';

const StyledLoadMoreButton = styled.div`
    padding-top: 0;
    & span {
        cursor: pointer;
        border: 2px solid rgba(0, 0, 0, 0.125);
        border-top: 0;
        border-top-right-radius: 0;
        border-top-left-radius: 0;
        border-bottom-right-radius: 12px;
        border-bottom-left-radius: 12px;
    }
    &.action:hover span {
        z-index: 1;
        color: #495057;
        text-decoration: underline;
        background-color: #f8f9fa;
    }
`;

const StyledListGroupItem = styled(ListGroupItem)`
    &:last-child {
        border-bottom-right-radius: ${props => (props.rounded === 'true' ? '0 !important' : '')};
    }
`;

const Results = props => {
    const getResourceLink = (filterClass, resourceId) => {
        let link = '';

        switch (filterClass) {
            case process.env.REACT_APP_CLASSES_PAPER: {
                link = reverse(ROUTES.VIEW_PAPER, { resourceId: resourceId });
                break;
            }
            case process.env.REACT_APP_CLASSES_PROBLEM: {
                link = reverse(ROUTES.RESEARCH_PROBLEM, { researchProblemId: resourceId });
                break;
            }
            case 'resource': {
                link = '/resource/' + resourceId; //TODO: replace this with a better resource view
                break;
            }
            case 'predicate': {
                link = '/predicate/' + resourceId; // TODO: replace with better predicate view
                break;
            }
            default: {
                link = '';
                break;
            }
        }

        return link;
    };

    return (
        <div>
            {props.loading && props.items === 0 && (
                <ContentLoader height={210} speed={2} primaryColor="#f3f3f3" secondaryColor="#ecebeb">
                    <rect x="0" y="8" width="50" height="15" />
                    <rect x="0" y="25" width="100%" height="15" />
                    <rect x="0" y="42" width="100%" height="15" />
                    <rect x="0" y="59" width="100%" height="15" />
                    <rect x="0" y="76" width="100%" height="15" />

                    <rect x="0" y={8 + 100} width="50" height="15" />
                    <rect x="0" y={25 + 100} width="100%" height="15" />
                    <rect x="0" y={42 + 100} width="100%" height="15" />
                    <rect x="0" y={59 + 100} width="100%" height="15" />
                    <rect x="0" y={76 + 100} width="100%" height="15" />
                </ContentLoader>
            )}

            {!props.loading && props.items.length === 0 && (
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
                                    </StyledListGroupItem>
                                );
                            })}
                        </ListGroup>
                        {!props.loading && props.hasNextPage && (
                            <StyledLoadMoreButton className="text-right action">
                                <span className="btn btn-link btn-sm" onClick={props.loadMore}>
                                    + Load more
                                </span>
                            </StyledLoadMoreButton>
                        )}
                        {props.loading && props.hasNextPage && (
                            <StyledLoadMoreButton className="text-right action">
                                <span className="btn btn-link btn-sm" onClick={props.loadMore}>
                                    Loading...
                                </span>
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
    hasNextPage: PropTypes.bool.isRequired
};

export default withRouter(Results);
