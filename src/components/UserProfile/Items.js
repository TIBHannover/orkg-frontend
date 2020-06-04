import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import PaperCard from 'components/PaperCard/PaperCard';
import ComparisonCard from 'components/ComparisonCard/ComparisonCard';
import { getStatementsBySubjects, getResourcesByClass } from 'network';
import { getPaperData, getComparisonData } from 'utils';
import { find } from 'lodash';
import { Button } from 'reactstrap';
import Confirm from 'reactstrap-confirm';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { updateResourceClasses } from 'network';
import { toast } from 'react-toastify';

const Items = props => {
    const pageSize = 5;
    const [isLoading, setIsLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [page, setPage] = useState(0);
    const [resources, setResources] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);

    const loadItems = useCallback(() => {
        setIsLoading(true);

        getResourcesByClass({
            id: props.filterClass,
            page: page + 1,
            items: pageSize,
            sortBy: 'id',
            desc: true,
            creator: props.userId
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
                        if (props.filterClass === process.env.REACT_APP_CLASSES_PAPER) {
                            return getPaperData(
                                resourceStatements.id,
                                resourceStatements && resourceSubject.label ? resourceSubject.label : 'No Title',
                                resourceStatements.statements
                            );
                        }
                        if (props.filterClass === process.env.REACT_APP_CLASSES_COMPARISON) {
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
        loadItems();
    }, [loadItems]);

    // reset resources when the userId has changed
    useEffect(() => {
        setResources([]);
    }, [props.userId]);

    const handleChange = paperId => {
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

    const handleDelete = async () => {
        const confirm = await Confirm({
            title: 'Are you sure?',
            message: `Are you sure you want to remove ${selectedItems.length} papers from the ORKG? Deleting papers is bad practice so we encourage you to use this operation with caution!`,
            cancelColor: 'light'
        });

        if (confirm) {
            setIsLoading(true);
            setResources([]);
            setSelectedItems([]);

            const promises = selectedItems.map(id => updateResourceClasses(id, [process.env.REACT_APP_CLASSES_PAPER_DELETED]));
            await Promise.all(promises);

            toast.success(`Successfully deleted ${selectedItems.length} paper${selectedItems.length !== 1 ? 's' : ''}`);

            // reload the papers, in case page is already 0, manually call loadItems()
            if (page === 0) {
                loadItems();
            } else {
                setPage(0);
            }
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
                        if (props.filterClass === process.env.REACT_APP_CLASSES_PAPER) {
                            const paperId = resource.id;
                            const selected = selectedItems.includes(paperId);

                            return (
                                <PaperCard
                                    selectable={props.showDelete}
                                    selected={selected}
                                    onChange={() => handleChange(paperId)}
                                    paper={{ title: resource.label, ...resource }}
                                    key={`pc${resource.id}`}
                                />
                            );
                        }
                        if (props.filterClass === process.env.REACT_APP_CLASSES_COMPARISON) {
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
                <Button size="sm" color="darkblue" className="mt-2" onClick={handleDelete}>
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
