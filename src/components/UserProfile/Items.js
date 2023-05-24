import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import ComparisonCard from 'components/Cards/ComparisonCard/ComparisonCard';
import PaperCard from 'components/Cards/PaperCard/PaperCard';
import ReviewCard from 'components/Cards/ReviewCard/ReviewCard';
import VisualizationCard from 'components/Cards/VisualizationCard/VisualizationCard';
import TemplateCard from 'components/Cards/TemplateCard/TemplateCard';
import ListCard from 'components/Cards/ListCard/ListCard';
import useDeletePapers from 'components/ViewPaper/hooks/useDeletePapers';
import { CLASSES } from 'constants/graphSettings';
import ROUTES from 'constants/routes.js';
import { find, flatten, groupBy } from 'lodash';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, ListGroup } from 'reactstrap';
import { getResourcesByClass } from 'services/backend/resources';
import { getStatementsBySubjects } from 'services/backend/statements';
import { getComparisonData, getListData, getVisualizationData, getPaperData, getReviewData, groupVersionsOfComparisons } from 'utils';
import { researchFieldUpdated } from 'slices/reviewSlice';

const Items = props => {
    const pageSize = 25;
    const [isLoading, setIsLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [page, setPage] = useState(0);
    const [resources, setResources] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const navigate = useNavigate();

    const loadItems = useCallback(
        p => {
            setIsLoading(true);

            getResourcesByClass({
                id: props.filterClass,
                page: p,
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
                    ids: result.content.map(c => c.id),
                })
                    .then(resourcesStatements => {
                        let newResources = resourcesStatements.map(resourceStatements => {
                            const resourceSubject = find(result.content, { id: resourceStatements.id });
                            if (props.filterClass === CLASSES.PAPER) {
                                return getPaperData(resourceSubject, resourceStatements.statements);
                            }
                            if (props.filterClass === CLASSES.COMPARISON) {
                                return getComparisonData(resourceSubject, resourceStatements.statements);
                            }
                            if (props.filterClass === CLASSES.SMART_REVIEW_PUBLISHED) {
                                return getReviewData(resourceSubject, resourceStatements.statements);
                            }
                            if (props.filterClass === CLASSES.LITERATURE_LIST_PUBLISHED) {
                                return getListData(resourceSubject, resourceStatements.statements);
                            }
                            if (props.filterClass === CLASSES.VISUALIZATION) {
                                return getVisualizationData(resourceSubject, resourceStatements.statements);
                            }
                            return resourceSubject;
                        });
                        if (props.filterClass === CLASSES.COMPARISON) {
                            setResources(prevResources =>
                                groupVersionsOfComparisons([...flatten([...prevResources.map(c => c.versions), ...prevResources]), ...newResources]),
                            );
                        } else if (props.filterClass === CLASSES.SMART_REVIEW_PUBLISHED) {
                            const groupedByPaper = groupBy(newResources, 'paperId');
                            newResources = Object.keys(groupedByPaper).map(paperId => [...groupedByPaper[paperId]]);
                            setResources(prevResources => [...prevResources, ...newResources]);
                        } else if (props.filterClass === CLASSES.LITERATURE_LIST_PUBLISHED) {
                            const groupedByPaper = groupBy(newResources, 'paperId');
                            newResources = Object.keys(groupedByPaper).map(paperId => [...groupedByPaper[paperId]]);
                            setResources(prevResources => [...prevResources, ...newResources]);
                        } else {
                            setResources(prevResources => [...prevResources, ...newResources]);
                        }

                        setIsLoading(false);
                        setHasNextPage(!result.last);
                        setPage(prevPage => prevPage + 1);
                    })
                    .catch(error => {
                        setIsLoading(false);
                        setHasNextPage(false);

                        console.log(error);
                    });
            });
        },
        [props.filterClass, props.userId],
    );

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
                <ListGroup flush className="rounded">
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
                        if (props.filterClass === CLASSES.NODE_SHAPE) {
                            return <TemplateCard template={resource} key={`pc${resource.id}`} />;
                        }

                        if (props.filterClass === CLASSES.SMART_REVIEW_PUBLISHED) {
                            return <ReviewCard key={resource[0]?.id} versions={resource} showBadge={false} showCurationFlags={true} />;
                        }
                        if (props.filterClass === CLASSES.VISUALIZATION) {
                            return <VisualizationCard visualization={resource} showBadge={false} showCurationFlags={true} key={`pc${resource.id}`} />;
                        }
                        if (props.filterClass === CLASSES.LITERATURE_LIST_PUBLISHED) {
                            return <ListCard versions={resource} showBadge={false} showCurationFlags={true} />;
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
                <div className="p-5 text-center mt-4 mb-4">
                    This user hasn't added any {props.filterLabel} to ORKG yet
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
