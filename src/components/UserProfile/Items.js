import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import PaperCard from 'components/PaperCard/PaperCard';
import ComparisonCard from 'components/ComparisonCard/ComparisonCard';
import { getStatementsBySubjects } from 'services/backend/statements';
import { getPaperData, getComparisonData, groupVersionsOfComparisons } from 'utils';
import { find, flatten } from 'lodash';
import { Button, ListGroup } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes.js';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { getResourcesByClass } from 'services/backend/resources';
import useDeletePapers from 'components/ViewPaper/hooks/useDeletePapers';
import { CLASSES } from 'constants/graphSettings';

const Items = props => {
    const pageSize = props.filterClass === CLASSES.COMPARISON ? 10 : 5;
    const [isLoading, setIsLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [page, setPage] = useState(0);
    const [resources, setResources] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const navigate = useNavigate();

    const finishLoadingCallback = () => {
        // reload the papers, in case page is already 0, manually call loadItems()
        if (page === 1) {
            loadItems(0);
        } else {
            setPage(0);
        }
    };

    const [deletePapers, loadingDeletePapers] = useDeletePapers({
        paperIds: selectedItems,
        finishLoadingCallback,
    });

    const comparePapers = () => {
        const contributionIds = flatten(resources.filter(r => selectedItems.includes(r.id))?.map(c => c.contributions?.map(c => c.id)));
        navigate(`${reverse(ROUTES.COMPARISON_NOT_PUBLISHED)}?contributions=${contributionIds.join(',')}`);
    };

    const loadItems = useCallback(
        page => {
            setIsLoading(true);

            getResourcesByClass({
                id: props.filterClass,
                page,
                items: pageSize,
                sortBy: 'created_at',
                desc: true,
                creator: props.userId,
            }).then(result => {
                // Resources
                if (result.totalElements === 0) {
                    setIsLoading(false);
                    setHasNextPage(false);
                    return;
                }
                // Fetch the data of each resource
                getStatementsBySubjects({
                    ids: result.content.map(p => p.id),
                })
                    .then(resourcesStatements => {
                        const new_resources = resourcesStatements.map(resourceStatements => {
                            const resourceSubject = find(result.content, { id: resourceStatements.id });
                            if (props.filterClass === CLASSES.PAPER) {
                                return getPaperData(resourceSubject, resourceStatements.statements);
                            }
                            if (props.filterClass === CLASSES.COMPARISON) {
                                return getComparisonData(resourceSubject, resourceStatements.statements);
                            }
                            return null;
                        });
                        if (props.filterClass === CLASSES.COMPARISON) {
                            setResources(prevResources =>
                                groupVersionsOfComparisons([...flatten([...prevResources.map(c => c.versions), ...prevResources]), ...new_resources]),
                            );
                        } else {
                            setResources(prevResources => [...prevResources, ...new_resources]);
                        }

                        setIsLoading(false);
                        setHasNextPage(!result.last);
                        setPage(page + 1);
                    })
                    .catch(error => {
                        setIsLoading(false);
                        setHasNextPage(false);

                        console.log(error);
                    });
            });
        },
        [pageSize, props.filterClass, props.userId],
    );

    useEffect(() => {
        if (loadingDeletePapers) {
            setIsLoading(true);
            setResources([]);
            setSelectedItems([]);
        }
    }, [loadingDeletePapers]);

    // reset resources when the userId has changed
    useEffect(() => {
        setResources([]);
        setHasNextPage(false);
        setPage(0);
    }, [props.userId]);

    useEffect(() => {
        loadItems(0);
    }, [loadItems]);

    const handleSelect = paperId => {
        if (selectedItems.includes(paperId)) {
            setSelectedItems(selectedItems.filter(id => id !== paperId));
        } else {
            setSelectedItems([...selectedItems, paperId]);
        }
    };

    const handleLoadMore = () => {
        if (!isLoading) {
            loadItems(page);
        }
    };

    const loadingIndicator = (
        <div className="text-center mt-3 mb-4">
            <Icon icon={faSpinner} spin /> Loading
        </div>
    );

    return (
        <div>
            {resources.length > 0 && (
                <ListGroup className="box">
                    {resources.map(resource => {
                        if (props.filterClass === CLASSES.PAPER) {
                            const paperId = resource.id;
                            const selected = selectedItems.includes(paperId);

                            return (
                                <PaperCard
                                    selectable={props.showDelete}
                                    selected={selected}
                                    onSelect={() => handleSelect(paperId)}
                                    paper={{ title: resource.label, ...resource }}
                                    key={`pc${resource.id}`}
                                />
                            );
                        }
                        if (props.filterClass === CLASSES.COMPARISON) {
                            return <ComparisonCard comparison={{ ...resource }} key={`pc${resource.id}`} />;
                        }
                        return null;
                    })}
                    {!isLoading && hasNextPage && (
                        <div
                            style={{ cursor: 'pointer' }}
                            className="list-group-item list-group-item-action text-center"
                            onClick={handleLoadMore}
                            onKeyDown={e => (e.keyCode === 13 ? handleLoadMore : undefined)}
                            role="button"
                            tabIndex={0}
                        >
                            View more {props.filterLabel}
                        </div>
                    )}
                </ListGroup>
            )}

            {isLoading && loadingIndicator}

            {resources.length === 0 && !isLoading && (
                <div className="box rounded-3 p-5 text-center mt-4 mb-4">
                    This user hasn't added any {props.filterLabel} to ORKG yet.
                    <br />
                </div>
            )}

            {selectedItems.length > 0 && (
                <>
                    {props.filterClass === CLASSES.PAPER && (
                        <Button size="sm" color="secondary" className="mt-2 me-2" onClick={comparePapers}>
                            Compare selected {props.filterLabel} ({selectedItems.length})
                        </Button>
                    )}

                    <Button size="sm" color="danger" className="mt-2" onClick={deletePapers}>
                        Delete selected {props.filterLabel} ({selectedItems.length})
                    </Button>
                </>
            )}
        </div>
    );
};

Items.propTypes = {
    userId: PropTypes.string.isRequired,
    filterLabel: PropTypes.string.isRequired,
    filterClass: PropTypes.string.isRequired,
    showDelete: PropTypes.bool,
};

Items.defaultProps = {
    showDelete: false,
};
export default Items;
