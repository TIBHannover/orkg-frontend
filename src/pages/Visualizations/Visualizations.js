import { useState, useEffect } from 'react';
import { getStatementsBySubjects, getStatementsByObjectAndPredicate } from 'services/backend/statements';
import { getResourcesByClass } from 'services/backend/resources';
import { Container, ListGroup } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { getVisualizationData } from 'utils';
import { find } from 'lodash';
import VisualizationCard from 'components/VisualizationCard/VisualizationCard';
import { CLASSES, PREDICATES } from 'constants/graphSettings';
import HeaderSearchButton from 'components/HeaderSearchButton/HeaderSearchButton';
import TitleBar from 'components/TitleBar/TitleBar';

const Visualizations = () => {
    const pageSize = 10;
    const [visualizations, setVisualizations] = useState([]);
    const [isNextPageLoading, setIsNextPageLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [page, setPage] = useState(0);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const [totalElements, setTotalElements] = useState(0);

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
            // Fetch the data of each visualization
            getStatementsBySubjects({ ids: result.content.map(p => p.id) })
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
                                find(result.content, { id: visualizationStatements.id }).label,
                                visualizationStatements.statements
                            )
                        }));
                    });
                    return Promise.all(visualizationsCalls);
                })
                .then(visualizationsData => {
                    setVisualizations(prevVisualizations => [...prevVisualizations, ...visualizationsData]);
                    setIsNextPageLoading(false);
                    setHasNextPage(!result.last);
                    setPage(prevPage => prevPage + 1);
                    setIsLastPageReached(result.last);
                    setTotalElements(result.totalElements);
                })
                .catch(error => {
                    setIsLastPageReached(true);
                    setHasNextPage(false);
                    setIsNextPageLoading(false);
                    console.log(error);
                });
        });
    };

    return (
        <>
            <TitleBar
                buttonGroup={<HeaderSearchButton placeholder="Search visualizations..." type={CLASSES.VISUALIZATION} />}
                titleAddition={
                    <div className="text-muted mt-1">
                        {totalElements === 0 && isNextPageLoading ? <Icon icon={faSpinner} spin /> : totalElements} visualizations
                    </div>
                }
            >
                View all published visualizations
            </TitleBar>

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
                    {!hasNextPage && isLastPageReached && page > 1 && totalElements !== 0 && (
                        <div className="text-center mt-3">You have reached the last page.</div>
                    )}
                </ListGroup>
            </Container>
        </>
    );
};
export default Visualizations;
