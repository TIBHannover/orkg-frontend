import { Checkbox, Input, Label, TextField } from '@heroui/react';
import { debounce } from 'lodash';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQueryState } from 'nuqs';

import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import usePaginate from '@/components/PaginatedContent/hooks/usePaginate';
import ListPaginatedContent from '@/components/PaginatedContent/ListPaginatedContent';
import ListGroup from '@/components/Ui/List/ListGroup';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { getResources, resourcesUrl } from '@/services/backend/resources';
import { Resource } from '@/services/backend/types';

type ClassInstancesProps = {
    title?: string;
    classId: string;
};

const ClassInstances = ({ title = 'class', classId }: ClassInstancesProps) => {
    const searchParams = useSearchParams();
    const [q, setQ] = useQueryState('q', { defaultValue: '' });

    const [isFormattedLabelEnabled, setIsFormattedLabelEnabled] = useQueryState('isFormattedLabelEnabled', {
        defaultValue: true,
        parse: (value) => value === 'true',
    });

    const renderListItem = (item: Resource) => (
        <div key={item.id} className="grid grid-cols-12 gap-4 p-3 border-b border-separator items-center">
            <div className="col-span-4 break-all">
                <DescriptionTooltip id={item.id} _class={item._class} classes={item.classes}>
                    <Link href={`${reverse(ROUTES.RESOURCE, { id: item.id })}?noRedirect`}>{item.id}</Link>
                </DescriptionTooltip>
            </div>
            <div className="col-span-6">
                <DescriptionTooltip id={item.id} _class={item._class} classes={item.classes}>
                    <Link href={`${reverse(ROUTES.RESOURCE, { id: item.id })}?noRedirect`}>
                        {isFormattedLabelEnabled && item.formatted_label ? item.formatted_label : item.label}
                    </Link>
                </DescriptionTooltip>
            </div>
            <div className="col-span-2">{item.shared}</div>
        </div>
    );

    const prefixParams = 'instances';

    const {
        data: items,
        isLoading,
        totalElements,
        hasNextPage,
        page,
        pageSize,
        setPage,
        setPageSize,
        error,
        totalPages,
    } = usePaginate({
        fetchFunction: getResources,
        fetchFunctionName: 'getResources',
        fetchUrl: resourcesUrl,
        fetchExtraParams: { include: [classId], q, returnFormattedLabels: true },
        prefixParams,
    });

    const handleSearch = debounce((term: string) => {
        setQ(term);
    }, 500);

    return (
        <div className="py-2 px-6">
            <div className="mt-4 flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                    <Label htmlFor="searchInputField">Search</Label>
                    <TextField
                        aria-label="Search"
                        defaultValue={searchParams.get('q')?.toString() ?? ''}
                        onChange={handleSearch}
                        maxLength={MAX_LENGTH_INPUT}
                    >
                        <Input id="searchInputField" type="text" placeholder="Enter a label" />
                    </TextField>
                </div>
                <Checkbox isSelected={isFormattedLabelEnabled} onChange={setIsFormattedLabelEnabled}>
                    <Checkbox.Content>
                        <Checkbox.Control>
                            <Checkbox.Indicator />
                        </Checkbox.Control>
                        Show formatted label when available
                    </Checkbox.Content>
                </Checkbox>
            </div>
            <p className="mt-2">Total number of instances: {!isLoading ? <b>{totalElements}</b> : 'Loading...'}</p>
            <div className="mt-4">
                <div className="border border-separator rounded">
                    <div className="grid grid-cols-12 gap-4 p-3 bg-surface-secondary border-b border-separator text-sm font-medium text-muted">
                        <div className="col-span-4">Resource ID</div>
                        <div className="col-span-6">Label</div>
                        <div className="col-span-2">Shared</div>
                    </div>
                    <ListPaginatedContent<Resource>
                        renderListItem={renderListItem}
                        pageSize={pageSize}
                        label={title}
                        isLoading={isLoading}
                        items={items ?? []}
                        hasNextPage={hasNextPage}
                        page={page}
                        setPage={setPage}
                        setPageSize={setPageSize}
                        totalElements={totalElements}
                        error={error}
                        totalPages={totalPages}
                        boxShadow={false}
                        ListGroupComponent={ListGroup}
                        flush={false}
                        listGroupProps={{ className: 'border-0' }}
                        prefixParams={prefixParams}
                    />
                </div>
            </div>
        </div>
    );
};

export default ClassInstances;
