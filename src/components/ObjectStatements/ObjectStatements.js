import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { getStatementsByObject } from 'services/backend/statements';
import { Button, Table, Collapse } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { reverse } from 'named-urls';
import { getLinkByEntityType } from 'utils';
import ROUTES from 'constants/routes.js';
import { Link } from 'react-router-dom';

const ObjectStatements = props => {
    const pageSize = 10;
    const { resourceId, setHasObjectStatement } = props;
    const [showObjectStatements, setShowObjectStatements] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [page, setPage] = useState(0);
    const [statements, setStatements] = useState([]);

    const loadStatements = useCallback(async () => {
        setIsLoading(true);

        const statements = await getStatementsByObject({
            id: resourceId,
            page: page,
            items: pageSize,
            sortBy: 'id',
            desc: true
        });

        if (page === 0 && statements.length === 0) {
            setHasObjectStatement(false);
        } else {
            setHasObjectStatement(true);
        }

        if (statements.length === 0) {
            setIsLoading(false);
            setHasNextPage(false);
        } else {
            setStatements(prevStatements => [...prevStatements, ...statements]);
            setIsLoading(false);
            setHasNextPage(statements.length < pageSize || statements.length === 0 ? false : true);
        }
    }, [page, resourceId, setHasObjectStatement]);

    useEffect(() => {
        loadStatements();
    }, [loadStatements]);

    // reset resources when the userId has changed
    useEffect(() => {
        setStatements([]);
    }, [resourceId]);

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
            <Button color="secondary" size="sm" className="mt-5" onClick={() => setShowObjectStatements(!showObjectStatements)}>
                {!showObjectStatements ? 'Show' : 'Hide'} object statements
            </Button>

            <Collapse isOpen={showObjectStatements}>
                {statements.length > 0 && (
                    <div>
                        <h3 className="h5 mt-3">Statements with this resource as object</h3>
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
                                            {getLinkByEntityType(statement.subject._class, statement.subject.id) ? (
                                                <Link to={getLinkByEntityType(statement.subject._class, statement.subject.id)}>
                                                    {statement.subject.label}
                                                </Link>
                                            ) : (
                                                statement.subject.label
                                            )}
                                        </td>
                                        <td>
                                            <Link to={reverse(ROUTES.PROPERTY, { id: statement.predicate.id })}>{statement.predicate.label}</Link>
                                        </td>
                                        <td>{statement.object.label}</td>
                                    </tr>
                                ))}
                                {!isLoading && hasNextPage && (
                                    <tr className="text-center">
                                        <td colSpan="3">
                                            <Button color="light" size="sm" onClick={handleLoadMore}>
                                                Load more statements
                                            </Button>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                )}

                {isLoading && loadingIndicator}

                {statements.length === 0 && !isLoading && <div className="text-center mb-2">This resource isn't used as an object yet</div>}
            </Collapse>
        </div>
    );
};

ObjectStatements.propTypes = {
    resourceId: PropTypes.string.isRequired,
    setHasObjectStatement: PropTypes.func
};

ObjectStatements.defaultProps = {
    setHasObjectStatement: () => {}
};

export default ObjectStatements;
