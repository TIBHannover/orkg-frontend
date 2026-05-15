import { Checkbox } from '@heroui/react';
import { useQueryState } from 'nuqs';
import { FC } from 'react';

import StatementCard from '@/components/Cards/StatementCard/StatementCard';
import ListPage from '@/components/PaginatedContent/ListPage';
import { getStatements, statementsUrl } from '@/services/backend/statements';
import { Statement } from '@/services/backend/types';

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
            <Checkbox className="m-4" isSelected={isFormattedLabelEnabled} onChange={setIsFormattedLabelEnabled}>
                <Checkbox.Control>
                    <Checkbox.Indicator />
                </Checkbox.Control>
                <Checkbox.Content>Show formatted label when available</Checkbox.Content>
            </Checkbox>
            <hr className="m-0" />
            <div className="py-3 text-sm font-medium text-muted" style={{ backgroundColor: 'var(--surface)' }}>
                <div className="flex flex-wrap items-center gap-y-2">
                    <div className="w-full px-4 sm:flex-1 sm:basis-0 sm:min-w-0">Subject</div>
                    <div className="w-full px-4 sm:flex-1 sm:basis-0 sm:min-w-0">Property</div>
                    <div className="w-full px-4 sm:flex-1 sm:basis-0 sm:min-w-0">Object</div>
                    <div className="w-full px-4 sm:flex-1 sm:basis-0 sm:min-w-0">Options</div>
                </div>
            </div>
            <hr className="m-0" />
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
