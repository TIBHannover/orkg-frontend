import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import ComparisonCard from 'components/Cards/ComparisonCard/ComparisonCard';
import ListCard from 'components/Cards/ListCard/ListCard';
import PaperCard from 'components/Cards/PaperCard/PaperCard';
import ReviewCard from 'components/Cards/ReviewCard/ReviewCard';
import TemplateCard from 'components/Cards/TemplateCard/TemplateCard';
import VisualizationCard from 'components/Cards/VisualizationCard/VisualizationCard';
import useRouter from 'components/NextJsMigration/useRouter';
import useDeletePapers from 'components/ViewPaper/hooks/useDeletePapers';
import { CLASSES } from 'constants/graphSettings';
import ROUTES from 'constants/routes.js';
import { find, flatten, groupBy } from 'lodash';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { Button, ListGroup } from 'reactstrap';
import { getResources } from 'services/backend/resources';
import { getStatementsBySubjects } from 'services/backend/statements';
import {
    addAuthorsToStatementBundle,
    convertComparisonToNewFormat,
    convertPaperToNewFormat,
    convertVisualizationToNewFormat,
    getComparisonData,
    getListData,
    getPaperData,
    getReviewData,
    getVisualizationData,
    groupVersionsOfComparisons,
} from 'utils';

const Items = ({ showDelete = false, filterClass, filterLabel, userId }) => {
    const pageSize = 25;
    const [isLoading, setIsLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [page, setPage] = useState(0);
    const [resources, setResources] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const router = useRouter();

    const loadItems = useCallback(
        p => {
            setIsLoading(true);

            getResources({
                include: [filterClass],
                page: p,
                size: pageSize,
                sortBy: 'created_at',
                desc: true,
                createdBy: userId,
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
                    .then(statements => addAuthorsToStatementBundle(statements))
                    .then(async resourcesStatements => {
                        let newResources = resourcesStatements.map(async resourceStatements => {
                            const resourceSubject = find(result.content, { id: resourceStatements.id });
                            if (filterClass === CLASSES.PAPER) {
                                return getPaperData(resourceSubject, resourceStatements.statements);
                            }
                            if (filterClass === CLASSES.COMPARISON) {
                                return getComparisonData(resourceSubject, resourceStatements.statements);
                            }
                            if (filterClass === CLASSES.SMART_REVIEW_PUBLISHED) {
                                return getReviewData(resourceSubject, resourceStatements.statements);
                            }
                            if (filterClass === CLASSES.LITERATURE_LIST_PUBLISHED) {
                                // function is async, so promise all needed later
                                return getListData(resourceSubject, resourceStatements.statements);
                            }
                            if (filterClass === CLASSES.VISUALIZATION) {
                                return getVisualizationData(resourceSubject, resourceStatements.statements);
                            }
                            return resourceSubject;
                        });
                        newResources = await Promise.all(newResources);

                        if (filterClass === CLASSES.COMPARISON) {
                            setResources(prevResources =>
                                groupVersionsOfComparisons([...flatten([...prevResources.map(c => c.versions), ...prevResources]), ...newResources]),
                            );
                        } else if (filterClass === CLASSES.SMART_REVIEW_PUBLISHED) {
                            const groupedByPaper = groupBy(newResources, 'paperId');
                            newResources = Object.keys(groupedByPaper).map(paperId => [...groupedByPaper[paperId]]);
                            setResources(prevResources => [...prevResources, ...newResources]);
                        } else if (filterClass === CLASSES.LITERATURE_LIST_PUBLISHED) {
                            const groupedByPaper = groupBy(newResources, 'listId');
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
        [filterClass, userId],
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
        router.push(`${reverse(ROUTES.COMPARISON_NOT_PUBLISHED)}?contributions=${contributionIds.join(',')}`);
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
    }, [userId]);

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
                        if (filterClass === CLASSES.PAPER) {
                            const paperId = resource.id;
                            const selected = selectedItems.includes(paperId);

                            return (
                                <PaperCard
                                    selectable={showDelete}
                                    selected={selected}
                                    onSelect={() => handleSelect(paperId)}
                                    paper={convertPaperToNewFormat(resource)}
                                    key={`pc${resource.id}`}
                                />
                            );
                        }
                        if (filterClass === CLASSES.COMPARISON) {
                            return <ComparisonCard comparison={convertComparisonToNewFormat(resource)} key={`pc${resource.id}`} />;
                        }
                        if (filterClass === CLASSES.NODE_SHAPE) {
                            return <TemplateCard template={resource} key={`pc${resource.id}`} />;
                        }

                        if (filterClass === CLASSES.SMART_REVIEW_PUBLISHED) {
                            return <ReviewCard key={resource[0]?.id} versions={resource} showBadge={false} showCurationFlags={true} />;
                        }
                        if (filterClass === CLASSES.VISUALIZATION) {
                            return (
                                <VisualizationCard
                                    visualization={convertVisualizationToNewFormat(resource)}
                                    showBadge={false}
                                    showCurationFlags={true}
                                    key={`pc${resource.id}`}
                                />
                            );
                        }
                        if (filterClass === CLASSES.LITERATURE_LIST_PUBLISHED) {
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
                            View more {filterLabel}
                        </div>
                    )}
                </ListGroup>
            )}

            {isLoading && loadingIndicator}

            {resources.length === 0 && !isLoading && (
                <div className="p-5 text-center mt-4 mb-4">
                    This user hasn't added any {filterLabel} to ORKG yet
                    <br />
                </div>
            )}

            {selectedItems.length > 0 && (
                <>
                    {filterClass === CLASSES.PAPER && (
                        <Button size="sm" color="secondary" className="mt-2 me-2" onClick={comparePapers}>
                            Compare selected {filterLabel} ({selectedItems.length})
                        </Button>
                    )}

                    <Button size="sm" color="danger" className="mt-2" onClick={deletePapers}>
                        Delete selected {filterLabel} ({selectedItems.length})
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

export default Items;
