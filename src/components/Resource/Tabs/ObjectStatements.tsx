import { reverse } from 'named-urls';
import Link from 'next/link';
import { useQueryState } from 'nuqs';

import StatementCard from '@/components/Cards/StatementCard/StatementCard';
import ListPage from '@/components/PaginatedContent/ListPage';
import Alert from '@/components/Ui/Alert/Alert';
import FormGroup from '@/components/Ui/Form/FormGroup';
import Input from '@/components/Ui/Input/Input';
import Label from '@/components/Ui/Label/Label';
import ROUTES from '@/constants/routes';
import { getStatements, statementsUrl } from '@/services/backend/statements';
import { Statement } from '@/services/backend/types';

const ObjectStatements = ({ id }: { id: string }) => {
    const renderListItem = (statement: Statement) => <StatementCard key={statement.id} statement={statement} />;

    const [isFormattedLabelEnabled, setIsFormattedLabelEnabled] = useQueryState('isFormattedLabelEnabled', {
        defaultValue: true,
        parse: (value) => value === 'true',
    });
    return (
        <div>
            <Alert color="info" className="m-1">
                <strong>Note:</strong> This tab shows statements pointing to this resource. For statements from this resource, visit the{' '}
                <Link href={`${reverse(ROUTES.RESOURCE, { id })}?tab=information&noRedirect`}>Resource information</Link> tab.
            </Alert>
            <FormGroup check className="m-3">
                <Label>
                    <Input type="checkbox" checked={isFormattedLabelEnabled} onChange={(e) => setIsFormattedLabelEnabled(e.target.checked)} /> Show
                    formatted label when available
                </Label>
            </FormGroup>
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
                fetchExtraParams={{ objectId: id, returnFormattedLabels: isFormattedLabelEnabled }}
                fetchFunctionName="getStatements"
                disableSearch
                flush={false}
            />
        </div>
    );
};

export default ObjectStatements;
