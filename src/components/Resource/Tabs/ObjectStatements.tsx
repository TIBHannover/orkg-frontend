import StatementCard from 'components/Cards/StatementCard/StatementCard';
import ListPage from 'components/PaginatedContent/ListPage';
import { getStatements, statementsUrl } from 'services/backend/statements';
import { Statement } from 'services/backend/types';

const ObjectStatements = ({ id }: { id: string }) => {
    const renderListItem = (statement: Statement) => <StatementCard key={statement.id} statement={statement} />;

    return (
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
                fetchExtraParams={{ objectId: id }}
                fetchFunctionName="getStatements"
                disableSearch
                flush={false}
            />
        </div>
    );
};

export default ObjectStatements;
