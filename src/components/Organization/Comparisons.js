import { useState, useEffect } from 'react';
import { Container, ListGroup } from 'reactstrap';
import { getStatementsBySubjects } from 'services/backend/statements';
import { getComparisonsByOrganizationId } from 'services/backend/organizations';
import ComparisonCard from 'components/ComparisonCard/ComparisonCard';
import ContentLoader from 'react-content-loader';
import { getComparisonData, groupVersionsOfComparisons } from 'utils';
import { find } from 'lodash';
import PropTypes from 'prop-types';

const Comparisons = ({ organizationsId }) => {
    const [isLoadingComparisons, setIsLoadingComparisons] = useState(null);
    const [comparisonsList, setComparisonsList] = useState([]);

    useEffect(() => {
        const loadComparisons = () => {
            setIsLoadingComparisons(true);
            getComparisonsByOrganizationId(organizationsId)
                .then(comparisons =>
                    // Fetch the data of each comparison
                    getStatementsBySubjects({
                        ids: comparisons.map(c => c.id),
                    }).then(resourcesStatements => {
                        const comparisonsData = resourcesStatements.map(resourceStatements => {
                            const comparisonSubject = find(comparisons, { id: resourceStatements.id });
                            const data = getComparisonData(comparisonSubject, resourceStatements.statements);
                            return data;
                        });
                        setComparisonsList(groupVersionsOfComparisons(comparisonsData));
                        setIsLoadingComparisons(false);
                    }),
                )
                .catch(error => {
                    setIsLoadingComparisons(false);
                });
        };

        loadComparisons();
    }, [organizationsId]);

    return (
        <>
            <Container className="d-flex align-items-center mt-4 mb-4">
                <div className="d-flex flex-grow-1">
                    <h1 className="h5 flex-shrink-0 mb-0">Comparisons</h1>
                </div>
            </Container>
            <Container className="p-0 box rounded">
                {!isLoadingComparisons && (
                    <ListGroup>
                        {comparisonsList.length > 0 ? (
                            <>
                                {comparisonsList.map(comparison => (
                                    <ComparisonCard comparison={comparison} key={`pc${comparison.id}`} />
                                ))}
                            </>
                        ) : (
                            <div className="text-center mt-4 mb-4">No Comparisons</div>
                        )}
                    </ListGroup>
                )}
                {isLoadingComparisons && (
                    <div className="text-center mt-4 mb-4 p-5 container box rounded">
                        <div className="text-start">
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
                    </div>
                )}
            </Container>
        </>
    );
};

Comparisons.propTypes = {
    organizationsId: PropTypes.string.isRequired,
};

export default Comparisons;
