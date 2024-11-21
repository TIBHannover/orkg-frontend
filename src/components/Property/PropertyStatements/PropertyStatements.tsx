import StatementCard from 'components/Cards/StatementCard/StatementCard';
import ListPage from 'components/PaginatedContent/ListPage';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { Button, Collapse } from 'reactstrap';
import { getStatements, statementsUrl } from 'services/backend/statements';
import { Statement } from 'services/backend/types';

const PropertyStatements = ({ propertyId }: { propertyId: string }) => {
    const [showPropertyStatements, setShowPropertyStatements] = useState(false);

    const renderListItem = (statement: Statement) => <StatementCard key={statement.id} statement={statement} />;

    return (
        <div className="clearfix">
            <Button color="secondary" size="sm" className="mt-5" onClick={() => setShowPropertyStatements(!showPropertyStatements)}>
                {!showPropertyStatements ? 'Show' : 'Hide'} property usage
            </Button>
            <Collapse isOpen={showPropertyStatements}>
                <div>
                    <hr className="mb-0" />
                    <div className="py-2" style={{ backgroundColor: '#f8f9fb' }}>
                        <div className="row">
                            <div className="col-sm">
                                <div className="px-3">Subject</div>
                            </div>
                            <div className="col-sm">Property</div>
                            <div className="col-sm">Object</div>
                            <div className="col-sm">Options</div>
                        </div>
                    </div>
                    <hr className="mt-0" />
                    <ListPage
                        label="statements"
                        boxShadow={false}
                        hideTitleBar
                        renderListItem={renderListItem}
                        fetchFunction={(params) => getStatements({ ...params, returnContent: false })}
                        fetchUrl={statementsUrl}
                        fetchExtraParams={{ predicateId: propertyId }}
                        fetchFunctionName="getStatements"
                        disableSearch
                        flush={false}
                    />
                </div>
            </Collapse>
        </div>
    );
};

PropertyStatements.propTypes = {
    propertyId: PropTypes.string.isRequired,
};

export default PropertyStatements;
