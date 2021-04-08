import { useState } from 'react';
import PropTypes from 'prop-types';
import usePropertyStatements from './hooks/usePropertyStatements';
import { Button, Table, Collapse } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes.js';
import { Link } from 'react-router-dom';

const PropertyStatements = ({ propertyId }) => {
    const { statements, isLoading, hasNextPage, totalElements, handleLoadMore } = usePropertyStatements({
        propertyId: propertyId,
        pageSize: 10
    });

    const [showPropertyStatements, setShowPropertyStatements] = useState(false);

    const loadingIndicator = (
        <div className="text-center mt-3 mb-4">
            <Icon icon={faSpinner} spin /> Loading
        </div>
    );

    return (
        <div>
            <Button color="secondary" size="sm" className="mt-5" onClick={() => setShowPropertyStatements(!showPropertyStatements)}>
                {!showPropertyStatements ? 'Show' : 'Hide'} property usage
            </Button>

            <Collapse isOpen={showPropertyStatements}>
                {statements.length > 0 && (
                    <div>
                        <h3 className="h5 mt-3">
                            {totalElements === 1 ? `There is ${totalElements} statement` : `There are ${totalElements} statements`} using this
                            property
                        </h3>
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
                                    <tr className="text-center">
                                        <td colspan="3">
                                            <Button color="light" size="sm" onClick={!isLoading ? handleLoadMore : undefined}>
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

                {statements.length === 0 && !isLoading && <div className="text-center mb-2">This property isn't used in any statement yet!</div>}
            </Collapse>
        </div>
    );
};

PropertyStatements.propTypes = {
    propertyId: PropTypes.string.isRequired
};

export default PropertyStatements;
