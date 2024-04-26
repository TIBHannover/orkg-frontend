import StatementCard from 'components/Cards/StatementCard/StatementCard';
import ListPage from 'components/ListPage/ListPage';
import pluralize from 'pluralize';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { getStatementsByObject } from 'services/backend/statements';

const ObjectStatements = ({ id }) => {
    const [totalStatements, setTotalStatements] = useState(0);

    const renderListItem = (statement) => <StatementCard key={statement.id} statement={statement} />;

    const fetchItems = async ({ page, pageSize }) => {
        const {
            content: items,
            last,
            totalElements,
        } = await getStatementsByObject({
            id,
            page,
            size: pageSize,
            returnContent: false,
        });
        setTotalStatements(totalElements);

        return {
            items,
            last,
            totalElements,
        };
    };

    return (
        <div>
            <div className="p-3 pb-0">{pluralize('statement', totalStatements, true)} referring to this resource.</div>
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
                hideTitleBar={true}
                renderListItem={renderListItem}
                fetchItems={fetchItems}
                disableSearch={true}
            />
        </div>
    );
};

ObjectStatements.propTypes = {
    id: PropTypes.string.isRequired,
};

export default ObjectStatements;
