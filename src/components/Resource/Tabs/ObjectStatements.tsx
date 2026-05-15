import { Alert, Checkbox, Separator } from '@heroui/react';
import Link from 'next/link';
import { useQueryState } from 'nuqs';

import StatementCard from '@/components/Cards/StatementCard/StatementCard';
import ListPage from '@/components/PaginatedContent/ListPage';
import { ENTITIES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { getStatements, statementsUrl } from '@/services/backend/statements';
import { Statement } from '@/services/backend/types';

export const STATEMENT_GRID_CLASSES = 'grid grid-cols-1 sm:grid-cols-4 gap-x-4 gap-y-2 px-4';

const ObjectStatements = ({ id, contentType, showInfoTabLink = true }: { id: string; contentType?: string; showInfoTabLink?: boolean }) => {
    const renderListItem = (statement: Statement) => <StatementCard key={statement.id} statement={statement} />;

    const [isFormattedLabelEnabled, setIsFormattedLabelEnabled] = useQueryState('isFormattedLabelEnabled', {
        defaultValue: true,
        parse: (value) => value === 'true',
    });

    const link =
        contentType === ENTITIES.RESOURCE
            ? reverse(ROUTES.RESOURCE_TABS, { id, activeTab: 'information' })
            : reverse(ROUTES.CONTENT_TYPE_TABS, { type: contentType, id, activeTab: 'information' });

    return (
        <div className="flex flex-col gap-3">
            {showInfoTabLink && (
                <Alert>
                    <Alert.Indicator />
                    <Alert.Content className="min-w-0 flex-1">
                        <Alert.Title>Note</Alert.Title>
                        <Alert.Description>
                            This tab shows statements pointing to this resource. For statements from this resource, visit the{' '}
                            <Link className="underline hover:no-underline" href={`${link}?tab=information&noRedirect`}>
                                {contentType} information
                            </Link>{' '}
                            tab.
                        </Alert.Description>
                    </Alert.Content>
                </Alert>
            )}
            <div className="box rounded-lg overflow-hidden">
                <div className="px-4 py-3">
                    <Checkbox isSelected={isFormattedLabelEnabled} onChange={setIsFormattedLabelEnabled}>
                        <Checkbox.Control>
                            <Checkbox.Indicator />
                        </Checkbox.Control>
                        <Checkbox.Content>Show formatted label when available</Checkbox.Content>
                    </Checkbox>
                </div>
                <Separator />
                <div className={`${STATEMENT_GRID_CLASSES} bg-surface-secondary py-2 text-xs font-semibold uppercase tracking-wide text-muted`}>
                    <div>Subject</div>
                    <div>Property</div>
                    <div>Object</div>
                    <div>Options</div>
                </div>
                <Separator />
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
        </div>
    );
};

export default ObjectStatements;
