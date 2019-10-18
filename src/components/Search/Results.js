import React from 'react';
import { withRouter } from 'react-router-dom';
import { ListGroup, ListGroupItem } from 'reactstrap';
import ROUTES from '../../constants/routes.js';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import ContentLoader from 'react-content-loader';

const Results = (props) => {
    const filteredResults = (filterClass) => {
        return (
            <ListGroup className="mb-3">
                {props.resources.map((resource, index) => {
                    if (!resource.classes.includes(filterClass)) {
                        return [];
                    }

                    return (
                        <ListGroupItem action key={`result-${index}`} className="pt-1 pb-1">
                            <Link to={getResourceLink(filterClass, resource.id)}>
                                {resource.label}
                            </Link>
                        </ListGroupItem>
                    )
                })}
            </ListGroup>
        );
    }

    const getResourceLink = (filterClass, resourceId) => {
        let link = '';

        switch (filterClass) {
            case process.env.REACT_APP_CLASSES_PAPER: {
                link = reverse(ROUTES.VIEW_PAPER, { resourceId: resourceId });
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
    }

    return (
        <div>
            {props.loading && (
                <ContentLoader
                    height={210}
                    speed={2}
                    primaryColor="#f3f3f3"
                    secondaryColor="#ecebeb"
                >
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

            {!props.loading && props.countResources() === 0 && (
                <div className="text-center mt-5">There are no results, please try a different search term</div>
            )}

            {!props.loading && Array.from(props.filters, ([key, filter]) => {
                if ((props.selectedFilters.length > 0 && !props.selectedFilters.includes(key)) || props.countFilteredResources(filter.class) === 0) {
                    return [];
                }

                return (
                    <div key={`results-${key}`}>
                        <h2 className="h5">{filter.label}</h2>
                        {filteredResults(filter.class)}
                    </div>
                );
            })}
        </div>
    )
}

Results.propTypes = {
    loading: PropTypes.bool.isRequired,
    countResources: PropTypes.func.isRequired,
    countFilteredResources: PropTypes.func.isRequired,
    filters: PropTypes.object.isRequired,
    selectedFilters: PropTypes.array.isRequired,
    resources: PropTypes.array.isRequired,
}

export default withRouter(Results);
