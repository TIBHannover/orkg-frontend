import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { getStatementsByPredicate } from 'services/backend/statements';
import { Button, Table, Collapse } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes.js';
import { Link } from 'react-router-dom';

const PropertyStatements = props => {
    const pageSize = 10;
    const { propertyId, setHasPropertyStatement } = props;
    const [showPropertyStatements, setShowPropertyStatements] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [page, setPage] = useState(0);
    const [statements, setStatements] = useState([]);

    const loadStatements = useCallback(() => {
        setIsLoading(true);

        getStatementsByPredicate({
            id: propertyId,
            page: page + 1,
            items: pageSize,
            sortBy: 'id',
            desc: true
        }).then(result => {
            // Resources
            if (page === 0 && result.length === 0) {
                setHasPropertyStatement(false);
            } else {
                setHasPropertyStatement(true);
            }

            if (result.length === 0) {
                setIsLoading(false);
                setHasNextPage(false);
                return;
            } else {
                setStatements(prevStatements => [...prevStatements, ...result]);
                setIsLoading(false);
                setHasNextPage(result.length < pageSize || result.length === 0 ? false : true);
            }
        });
    }, [page, propertyId, setHasPropertyStatement]);

    useEffect(() => {
        loadStatements();
    }, [loadStatements]);

    // reset resources when the userId has changed
    useEffect(() => {
        setStatements([]);
    }, [propertyId]);

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
            <Button color="darkblue" size="sm" className="mt-5" onClick={() => setShowPropertyStatements(!showPropertyStatements)}>
                {!showPropertyStatements ? 'Show' : 'Hide'} property usage
            </Button>

            <Collapse isOpen={showPropertyStatements}>
                {statements.length > 0 && (
                    <div>
                        <h3 className="h5 mt-3">Statements of this property</h3>
                        <Table size="sm" bordered>
                            <thead>
                                <tr>
                                    <th width="33%">Subject</th>
                                    <th width="33%">Property</th>
                                    <th width="33%">Object</th>
                                </tr>
                            </thead>
                            <tbody>
                                {statements.map(statement => (
                                    <tr key={statement.id}>
                                        <td>
                                            <Link to={reverse(ROUTES.RESOURCE, { id: statement.subject.id })}>{statement.subject.label}</Link>
                                        </td>
                                        <td>{statement.predicate.label}</td>
                                        <td>
                                            <Link to={reverse(ROUTES.RESOURCE, { id: statement.object.id })}>{statement.object.label}</Link>
                                        </td>
                                    </tr>
                                ))}
                                {!isLoading && hasNextPage && (
                                    <tr style={{ cursor: 'pointer' }} className="text-center" onClick={handleLoadMore}>
                                        <td colSpan="3">View more statements of the property</td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                )}

                {isLoading && loadingIndicator}

                {statements.length === 0 && !isLoading && <div className="text-center mb-2">This property isn't used in any statement yet!</div>}
            </Collapse>
        </div>
    );
};

PropertyStatements.propTypes = {
    propertyId: PropTypes.string.isRequired,
    setHasPropertyStatement: PropTypes.func
};

PropertyStatements.defaultProps = {
    setHasPropertyStatement: () => {}
};

export default PropertyStatements;
