import { useState, useEffect } from 'react';
import { getStatementsBySubjects, getStatementsByObjectAndPredicate } from 'services/backend/statements';
import { getResourcesByClass } from 'services/backend/resources';
import { Container, ButtonGroup, ListGroup } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { getVisualizationData } from 'utils';
import { find } from 'lodash';
import VisualizationCard from 'components/VisualizationCard/VisualizationCard';
import { CLASSES, PREDICATES } from 'constants/graphSettings';
import HeaderSearchButton from 'components/HeaderSearchButton/HeaderSearchButton';

const Visualizations = () => {
    const pageSize = 25;
    const [visualizations, setVisualizations] = useState([]);
    const [isNextPageLoading, setIsNextPageLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [page, setPage] = useState(1);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    //const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        document.title = 'Visualizations - ORKG';

        loadMoreVisualizations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadMoreVisualizations = () => {
        setIsNextPageLoading(true);
        getResourcesByClass({
            id: CLASSES.VISUALIZATION,
            page: page,
            items: pageSize,
            sortBy: 'created_at',
            desc: true
        }).then(result => {
            if (result.length > 0) {
                // Fetch the data of each visualization
                getStatementsBySubjects({ ids: result.map(p => p.id) })
                    .then(visualizationsStatements => {
                        const visualizationsCalls = visualizationsStatements.map(visualizationStatements => {
                            // Fetch the comparison id of each visualization
                            return getStatementsByObjectAndPredicate({
                                objectId: visualizationStatements.id,
                                predicateId: PREDICATES.HAS_VISUALIZATION
                            }).then(comparisonStatement => ({
                                comparisonId: comparisonStatement.length > 0 ? comparisonStatement[0].subject.id : null,
                                ...getVisualizationData(
                                    visualizationStatements.id,
                                    find(result, { id: visualizationStatements.id }).label,
                                    visualizationStatements.statements
                                )
                            }));
                        });
                        return Promise.all(visualizationsCalls);
                    })
                    .then(visualizationsData => {
                        setVisualizations(prevVisualizations => [...prevVisualizations, ...visualizationsData]);
                        setIsNextPageLoading(false);
                        setHasNextPage(visualizationsData.length < pageSize ? false : true);
                        setPage(prevPage => prevPage + 1);
                        //setIsLastPageReached(result.last);
                        //setTotalElements(result.totalElements);
                    })
                    .catch(error => {
                        setIsLastPageReached(true);
                        setHasNextPage(false);
                        setIsNextPageLoading(false);
                        console.log(error);
                    });
            } else {
                setIsLastPageReached(true);
                setHasNextPage(false);
                setIsNextPageLoading(false);
                //setTotalElements(0);
            }
        });
    };

    return (
        <>
            <Container className="d-flex align-items-center">
                <h1 className="h4 flex-grow-1 mt-4 mb-4">View all published visualizations</h1>
                <ButtonGroup>
                    <HeaderSearchButton placeholder="Search visualizations..." type={CLASSES.VISUALIZATION} />
                </ButtonGroup>
            </Container>

            <Container className="p-0">
                <ListGroup flush className="box rounded" style={{ overflow: 'hidden' }}>
                    {visualizations.length > 0 && (
                        <div>
                            {visualizations.map(visualization => {
                                return <VisualizationCard visualization={visualization} key={`vis${visualization.id}`} />;
                            })}
                        </div>
                    )}
                    {visualizations.length === 0 && !isNextPageLoading && <div className="text-center mt-4 mb-4">No published visualization</div>}
                    {isNextPageLoading && (
                        <div className="text-center mt-4 mb-4">
                            <Icon icon={faSpinner} spin /> Loading
                        </div>
                    )}
                    {!isNextPageLoading && hasNextPage && (
                        <div
                            style={{ cursor: 'pointer' }}
                            className="list-group-item list-group-item-action text-center mt-2"
                            onClick={!isNextPageLoading ? loadMoreVisualizations : undefined}
                            onKeyDown={e => (e.keyCode === 13 ? (!isNextPageLoading ? loadMoreVisualizations : undefined) : undefined)}
                            role="button"
                            tabIndex={0}
                        >
                            Load more visualizations
                        </div>
                    )}
                    {!hasNextPage && isLastPageReached && page > 2 && <div className="text-center mt-3">You have reached the last page.</div>}
                </ListGroup>
            </Container>
        </>
    );
};
export default Visualizations;
