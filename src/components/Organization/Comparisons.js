import { useCallback, useState, useEffect } from 'react';
import { Container, ListGroup } from 'reactstrap';
import { getStatementsBySubjects } from 'services/backend/statements';
import { getComparisonsByOrganizationId } from 'services/backend/organizations';
import ComparisonCard from 'components/Cards/ComparisonCard/ComparisonCard';
import ContentLoader from 'react-content-loader';
import { getComparisonData, groupVersionsOfComparisons } from 'utils';
import { find, flatten } from 'lodash';
import PropTypes from 'prop-types';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const Comparisons = ({ organizationsId }) => {
    const [isLoadingComparisons, setIsLoadingComparisons] = useState(null);
    const [comparisonsList, setComparisonsList] = useState([]);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);

    const loadComparisons = useCallback(
        page => {
            setIsLoadingComparisons(true);
            getComparisonsByOrganizationId(organizationsId, page)
                .then(comparisons =>
                    // Fetch the data of each comparison
                    getStatementsBySubjects({
                        ids: comparisons.content.map(c => c.id),
                    }).then(resourcesStatements => {
                        const comparisonsData = resourcesStatements.map(resourceStatements => {
                            const comparisonSubject = find(comparisons.content, { id: resourceStatements.id });
                            const data = getComparisonData(comparisonSubject, resourceStatements.statements);
                            return data;
                        });
                        setComparisonsList(prevComparisons => {
                            const updatedComparisons = groupVersionsOfComparisons([
                                ...flatten([...prevComparisons.map(c => c.versions ?? []), ...prevComparisons]),
                                ...comparisonsData,
                            ]);
                            return flatten([...prevComparisons, updatedComparisons.filter(t => t && !prevComparisons.map(p => p.id).includes(t.id))]);
                        });
                        setIsLoadingComparisons(false);
                        setHasNextPage(!comparisons.last);
                        setIsLastPageReached(comparisons.last);
                        setCurrentPage(page + 1);
                    }),
                )
                .catch(error => {
                    setIsLoadingComparisons(false);
                    setHasNextPage(false);
                });
        },
        [organizationsId],
    );

    useEffect(() => {
        loadComparisons(0);
    }, []);

    const handleLoadMore = () => {
        if (!isLoadingComparisons) {
            loadComparisons(currentPage);
        }
    };

    return (
        <>
            <Container className="d-flex align-items-center mt-4 mb-4">
                <div className="d-flex flex-grow-1">
                    <h1 className="h5 flex-shrink-0 mb-0">Comparisons</h1>
                </div>
            </Container>
            <Container className="p-0 box rounded">
                {comparisonsList.length > 0 && (
                    <ListGroup>
                        <>
                            {comparisonsList.map(comparison => (
                                <ComparisonCard comparison={comparison} key={`pc${comparison.id}`} />
                            ))}
                        </>
                        {!isLoadingComparisons && hasNextPage && (
                            <div
                                style={{ cursor: 'pointer' }}
                                className="list-group-item list-group-item-action text-center"
                                onClick={!isLoadingComparisons ? handleLoadMore : undefined}
                                onKeyDown={e => (e.keyCode === 13 ? (!isLoadingComparisons ? handleLoadMore : undefined) : undefined)}
                                role="button"
                                tabIndex={0}
                            >
                                Load more content
                            </div>
                        )}
                        {!hasNextPage && isLastPageReached && currentPage !== 1 && (
                            <div className="text-center m-2">You have reached the last page</div>
                        )}
                    </ListGroup>
                )}
                {isLoadingComparisons && (
                    <div className={`mt-2 mb-4 ${currentPage === 0 ? 'p-5 container box rounded' : ''}`}>
                        {currentPage !== 0 && (
                            <div className="text-center">
                                <Icon icon={faSpinner} spin /> Loading
                            </div>
                        )}
                        {currentPage === 0 && (
                            <div className="text-left">
                                <ContentLoader
                                    speed={2}
                                    width={400}
                                    height={50}
                                    viewBox="0 0 400 50"
                                    style={{ width: '100% !important' }}
                                    backgroundColor="#f3f3f3"
                                    foregroundColor="#ecebeb"
                                >
                                    <rect x="0" y="0" rx="3" ry="3" width="400" height="20" />
                                    <rect x="0" y="25" rx="3" ry="3" width="300" height="20" />
                                </ContentLoader>
                            </div>
                        )}
                    </div>
                )}
                {comparisonsList.length === 0 && !isLoadingComparisons && <div className="text-center p-4">No comparisons</div>}
            </Container>
        </>
    );
};

Comparisons.propTypes = {
    organizationsId: PropTypes.string.isRequired,
};

export default Comparisons;
