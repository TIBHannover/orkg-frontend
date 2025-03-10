import StatementCard from 'components/Cards/StatementCard/StatementCard';
import ListPage from 'components/PaginatedContent/ListPage';
import { useQueryState } from 'nuqs';
import { FC } from 'react';
import { FormGroup, Input, Label } from 'reactstrap';
import { getStatements, statementsUrl } from 'services/backend/statements';
import { Statement } from 'services/backend/types';

type PropertyStatementsProps = {
    id: string;
};

const PropertyStatements: FC<PropertyStatementsProps> = ({ id }) => {
    const renderListItem = (statement: Statement) => <StatementCard key={statement.id} statement={statement} />;

    const [isFormattedLabelEnabled, setIsFormattedLabelEnabled] = useQueryState('isFormattedLabelEnabled', {
        defaultValue: true,
        parse: (value) => value === 'true',
    });

    return (
        <div>
            <FormGroup check className="m-3">
                <Label>
                    <Input type="checkbox" checked={isFormattedLabelEnabled} onChange={(e) => setIsFormattedLabelEnabled(e.target.checked)} /> Show
                    formatted label when available
                </Label>
            </FormGroup>
            <hr className="mb-0" />
            <div className="py-2" style={{ backgroundColor: '#f8f9fb' }}>
                <div className="row">
                    <div className="col-sm col-3">
                        <div className="px-3">Subject</div>
                    </div>
                    <div className="col-sm col-3">Property</div>
                    <div className="col-sm col-3">Object</div>
                    <div className="col-sm col-3">Options</div>
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
                fetchExtraParams={{ predicateId: id, returnFormattedLabels: isFormattedLabelEnabled }}
                fetchFunctionName="getStatements"
                disableSearch
                flush={false}
            />
        </div>
    );
};

export default PropertyStatements;
