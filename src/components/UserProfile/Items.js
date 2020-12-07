import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import PaperCard from 'components/PaperCard/PaperCard';
import ComparisonCard from 'components/ComparisonCard/ComparisonCard';
import { getStatementsBySubjects } from 'services/backend/statements';
import { getPaperData, getComparisonData } from 'utils';
import { find } from 'lodash';
import { Button } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { getResourcesByClass } from 'services/backend/resources';
import useDeletePapers from 'components/ViewPaper/hooks/useDeletePapers';
import { CLASSES } from 'constants/graphSettings';

const Items = props => {
    const pageSize = 5;
    const [isLoading, setIsLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [page, setPage] = useState(0);
    const [resources, setResources] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);

    const finishLoadingCallback = () => {
        // reload the papers, in case page is already 0, manually call loadItems()
        if (page === 0) {
            loadItems();
        } else {
            setPage(0);
        }
    };

    const [deletePapers, loadingDeletePapers] = useDeletePapers({
        paperIds: selectedItems,
        finishLoadingCallback
    });

    const loadItems = useCallback(() => {
        setIsLoading(true);

        getResourcesByClass({
            id: props.filterClass,
            page: page,
            items: pageSize,
            sortBy: 'id',
            desc: true,
            creator: props.userId,
            returnContent: true
        }).then(result => {
            // Resources
            if (result.length === 0) {
                setIsLoading(false);
                setHasNextPage(false);
                return;
            }
            // Fetch the data of each resource
            getStatementsBySubjects({
                ids: result.map(p => p.id)
            })
                .then(resourcesStatements => {
                    const resources = resourcesStatements.map(resourceStatements => {
                        const resourceSubject = find(result, { id: resourceStatements.id });
                        if (props.filterClass === CLASSES.PAPER) {
                            return getPaperData(
                                resourceStatements.id,
                                resourceStatements && resourceSubject.label ? resourceSubject.label : 'No Title',
                                resourceStatements.statements
                            );
                        }
                        if (props.filterClass === CLASSES.COMPARISON) {
                            return getComparisonData(
                                resourceStatements.id,
                                resourceStatements && resourceSubject.label ? resourceSubject.label : 'No Title',
                                resourceStatements.statements
                            );
                        }
                        return null;
                    });
                    setResources(prevResources => [...prevResources, ...resources]);
                    setIsLoading(false);
                    setHasNextPage(resources.length < pageSize || resources.length === 0 ? false : true);
                })
                .catch(error => {
                    setIsLoading(false);
                    setHasNextPage(false);

                    console.log(error);
                });
        });
    }, [page, props.filterClass, props.userId]);

    useEffect(() => {
        if (loadingDeletePapers) {
            setIsLoading(true);
            setResources([]);
            setSelectedItems([]);
        }
    }, [loadingDeletePapers]);

    useEffect(() => {
        loadItems();
    }, [loadItems]);

    // reset resources when the userId has changed
    useEffect(() => {
        setResources([]);
    }, [props.userId]);

    const handleSelect = paperId => {
        if (selectedItems.includes(paperId)) {
            setSelectedItems(selectedItems.filter(id => id !== paperId));
        } else {
            setSelectedItems([...selectedItems, paperId]);
        }
    };

    const handleLoadMore = () => {
        if (!isLoading) {
            setPage(page + 1);
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
                <div>
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
                        <div style={{ cursor: 'pointer' }} className="list-group-item list-group-item-action text-center" onClick={handleLoadMore}>
                            View more {props.filterLabel}
                        </div>
                    )}
                </div>
            )}

            {isLoading && loadingIndicator}

            {resources.length === 0 && !isLoading && (
                <div className="text-center mb-2">This user hasn't added any {props.filterLabel} to ORKG yet.</div>
            )}

            {selectedItems.length > 0 && (
                <Button size="sm" color="danger" className="mt-2" onClick={deletePapers}>
                    Delete selected {props.filterLabel} ({selectedItems.length})
                </Button>
            )}
        </div>
    );
};

Items.propTypes = {
    userId: PropTypes.string.isRequired,
    filterLabel: PropTypes.string.isRequired,
    filterClass: PropTypes.string.isRequired,
    showDelete: PropTypes.bool
};

Items.defaultProps = {
    showDelete: false
};
export default Items;
