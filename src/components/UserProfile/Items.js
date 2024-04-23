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
import { flatten } from 'lodash';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { Button, ListGroup } from 'reactstrap';
import { getComparisons } from 'services/backend/comparisons';
import { getLiteratureLists } from 'services/backend/literatureLists';
import { getPapers } from 'services/backend/papers';
import { getResources } from 'services/backend/resources';
import { getReviews } from 'services/backend/reviews';
import { getVisualizations } from 'services/backend/visualizations';

const Items = ({ showDelete = false, filterClass, filterLabel, filters = {} }) => {
    const pageSize = 25;
    const [isLoading, setIsLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [page, setPage] = useState(0);
    const [resources, setResources] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const router = useRouter();

    const loadItems = useCallback(
        async (p) => {
            setIsLoading(true);

            let response;
            if (filterClass === CLASSES.PAPER) {
                response = await getPapers({ page: p, size: pageSize, ...filters });
            } else if (filterClass === CLASSES.COMPARISON) {
                response = await getComparisons({ page: p, size: pageSize, ...filters });
            } else if (filterClass === CLASSES.VISUALIZATION) {
                response = await getVisualizations({ page: p, size: pageSize, visibility: null, ...filters });
            } else if (filterClass === CLASSES.SMART_REVIEW) {
                response = await getReviews({ page: p, size: pageSize, visibility: null, ...filters });
            } else if (filterClass === CLASSES.LITERATURE_LIST) {
                response = await getLiteratureLists({ page: p, size: pageSize, visibility: null, ...filters });
            } else if (filterClass === CLASSES.NODE_SHAPE) {
                response = await getResources({
                    include: [CLASSES.NODE_SHAPE],
                    page: p,
                    size: pageSize,
                    sortBy: 'created_at',
                    desc: true,
                    createdBy: filters.created_by,
                    ...filters,
                });
            }
            if (response.totalElements === 0) {
                setIsLoading(false);
                setHasNextPage(false);
                return;
            }

            setResources((prevResources) => [...prevResources, ...response.content]);
            setIsLoading(false);
            setHasNextPage(!response.last);
            setPage((prevPage) => prevPage + 1);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [filterClass],
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
        const contributionIds = flatten(resources.filter((r) => selectedItems.includes(r.id))?.map((c) => c.contributions?.map((c) => c.id)));
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
    }, [filters?.created_by]);

    useEffect(() => {
        loadItems(0);
    }, [loadItems]);

    const handleSelect = (paperId) => {
        if (selectedItems.includes(paperId)) {
            setSelectedItems(selectedItems.filter((id) => id !== paperId));
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
                    {resources.map((resource) => {
                        if (filterClass === CLASSES.PAPER) {
                            const paperId = resource.id;
                            const selected = selectedItems.includes(paperId);

                            return (
                                <PaperCard
                                    selectable={showDelete}
                                    selected={selected}
                                    onSelect={() => handleSelect(paperId)}
                                    paper={resource}
                                    key={`pc${resource.id}`}
                                />
                            );
                        }
                        if (filterClass === CLASSES.COMPARISON) {
                            return <ComparisonCard comparison={resource} key={`pc${resource.id}`} />;
                        }
                        if (filterClass === CLASSES.NODE_SHAPE) {
                            return <TemplateCard template={resource} key={`pc${resource.id}`} />;
                        }
                        if (filterClass === CLASSES.SMART_REVIEW) {
                            return <ReviewCard key={resource[0]?.id} review={resource} showBadge={false} showCurationFlags={true} />;
                        }
                        if (filterClass === CLASSES.VISUALIZATION) {
                            return <VisualizationCard visualization={resource} showBadge={false} showCurationFlags={true} key={`pc${resource.id}`} />;
                        }
                        if (filterClass === CLASSES.LITERATURE_LIST_PUBLISHED) {
                            return <ListCard key={`pc${resource.id}`} versions={resource} showBadge={false} showCurationFlags={true} />;
                        }
                        if (filterClass === CLASSES.LITERATURE_LIST) {
                            return <ListCard key={`pc${resource.id}`} list={resource} showBadge={false} showCurationFlags={true} />;
                        }
                        return null;
                    })}
                    {!isLoading && hasNextPage && (
                        <div
                            style={{ cursor: 'pointer' }}
                            className="list-group-item list-group-item-action text-center"
                            onClick={handleLoadMore}
                            onKeyDown={(e) => (e.keyCode === 13 ? handleLoadMore : undefined)}
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
                    There are no {filterLabel} found
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
    userId: PropTypes.string,
    filterLabel: PropTypes.string.isRequired,
    filterClass: PropTypes.string.isRequired,
    showDelete: PropTypes.bool,
    filters: PropTypes.object,
};

export default Items;
